const express = require("express");
const { callGemini } = require("../services/gemini");
const {
  buildFinalAnalysisPrompt,
  buildImportPrompt
} = require("../prompts/cognicheck-analysis");
const {
  trackAnalysisEvent,
  trackPrompt
} = require("../services/analytics-db");

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { base64, mimeType, prompt, maxOutputTokens } = req.body;

  if (!base64 || !mimeType || !prompt) {
    return res.status(400).json({ error: "Missing base64, mimeType, or prompt." });
  }

  try {
    const data = await callGemini({
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: base64 } }
      ],
      ...(maxOutputTokens && {
        generationConfig: { maxOutputTokens }
      })
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/analyze-report", async (req, res) => {
  const {
    mode,
    image,
    supportingFiles,
    selectedLanguage,
    backgroundContext,
    extractedDocumentText,
    structuredContext
  } = req.body;

  if (!mode || !image?.base64 || !image?.mimeType) {
    return res.status(400).json({ error: "Missing mode or image data." });
  }

  if (!["import", "analysis"].includes(mode)) {
    return res.status(400).json({ error: "Invalid analysis mode." });
  }

  try {
    const prompt =
      mode === "import"
        ? buildImportPrompt({ selectedLanguage, backgroundContext, extractedDocumentText })
        : buildFinalAnalysisPrompt({
            selectedLanguage,
            backgroundContext,
            extractedDocumentText,
            structuredContext
          });

    // Store the generated text prompt for review, but never store image Base64 here.
    await trackPrompt({ mode, selectedLanguage, prompt });

    const fileParts = (supportingFiles || []).map(file => ({
      inline_data: {
        mime_type: file.mimeType,
        data: file.base64
      }
    }));

    const data = await callGemini({
      parts: [
        { text: prompt },
        ...fileParts,
        { inline_data: { mime_type: image.mimeType, data: image.base64 } }
      ],
      ...(["import", "analysis"].includes(mode) && {
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    await trackAnalysisEvent({ mode, selectedLanguage, success: true });
    res.json(data);
  } catch (error) {
    await trackAnalysisEvent({
      mode,
      selectedLanguage,
      success: false,
      error: error.message
    });

    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
