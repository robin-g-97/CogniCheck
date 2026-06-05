const express = require("express");
const crypto = require("crypto");
const { callGemini, extractGeminiText } = require("../services/gemini");
const {
  buildFinalAnalysisPrompt,
  buildImportPrompt
} = require("../prompts/cognicheck-analysis");
const {
  trackAnalysisEvent,
  trackLlmInput,
  trackLlmOutput
} = require("../services/analytics-db");

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { base64, mimeType, prompt, maxOutputTokens } = req.body;
  const requestId = crypto.randomUUID();
  const userEmail = req.sessionEmail || "";

  if (!base64 || !mimeType || !prompt) {
    return res.status(400).json({ error: "Missing base64, mimeType, or prompt." });
  }

  try {
    await trackLlmInput({
      requestId,
      userEmail,
      mode: "legacy-image-analysis",
      selectedLanguage: "",
      input: JSON.stringify({
        prompt,
        image: {
          mimeType,
          base64Length: base64.length
        },
        maxOutputTokens: maxOutputTokens || null
      })
    });

    const data = await callGemini({
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: base64 } }
      ],
      ...(maxOutputTokens && {
        generationConfig: { maxOutputTokens }
      })
    });

    await trackLlmOutput({
      requestId,
      userEmail,
      mode: "legacy-image-analysis",
      selectedLanguage: "",
      output: extractGeminiText(data)
    });

    await trackAnalysisEvent({
      requestId,
      userEmail,
      mode: "legacy-image-analysis",
      selectedLanguage: "",
      success: true
    });

    res.json(data);
  } catch (error) {
    await trackAnalysisEvent({
      requestId,
      userEmail,
      mode: "legacy-image-analysis",
      selectedLanguage: "",
      success: false,
      error: error.message
    });

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
  const requestId = crypto.randomUUID();
  const userEmail = req.sessionEmail || "";

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

    await trackLlmInput({
      requestId,
      userEmail,
      mode,
      selectedLanguage,
      input: JSON.stringify({
        prompt,
        backgroundContext: backgroundContext || "",
        extractedDocumentText: extractedDocumentText || "",
        structuredContext: structuredContext || null,
        image: {
          mimeType: image.mimeType,
          base64Length: image.base64.length
        },
        supportingFiles: (supportingFiles || []).map(file => ({
          mimeType: file.mimeType,
          base64Length: file.base64?.length || 0
        }))
      })
    });

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

    await trackLlmOutput({
      requestId,
      userEmail,
      mode,
      selectedLanguage,
      output: extractGeminiText(data)
    });

    await trackAnalysisEvent({ requestId, userEmail, mode, selectedLanguage, success: true });
    res.json(data);
  } catch (error) {
    await trackAnalysisEvent({
      requestId,
      userEmail,
      mode,
      selectedLanguage,
      success: false,
      error: error.message
    });

    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
