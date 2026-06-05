const express = require("express");
const crypto = require("crypto");
const { callGemini, extractGeminiText } = require("../services/gemini");
const { requirementsBlueprintPrompt } = require("../prompts/requirements-blueprint");
const {
  trackAnalysisEvent,
  trackLlmInput,
  trackLlmOutput
} = require("../services/analytics-db");

const router = express.Router();

router.post("/api/analyze-requirements", async (req, res) => {
  const { text } = req.body;
  const requestId = crypto.randomUUID();
  const userEmail = req.sessionEmail || "";

  if (!text) {
    return res.status(400).json({ error: "Missing requirements text." });
  }

  try {
    const prompt = requirementsBlueprintPrompt(text);

    await trackLlmInput({
      requestId,
      userEmail,
      mode: "requirements-blueprint",
      selectedLanguage: "",
      input: JSON.stringify({
        prompt,
        requirementsText: text
      })
    });

    const data = await callGemini({
      parts: [{ text: prompt }]
    });

    const message = extractGeminiText(data);

    await trackLlmOutput({
      requestId,
      userEmail,
      mode: "requirements-blueprint",
      selectedLanguage: "",
      output: message
    });

    await trackAnalysisEvent({
      requestId,
      userEmail,
      mode: "requirements-blueprint",
      selectedLanguage: "",
      success: true
    });

    res.json({ message });
  } catch (error) {
    await trackAnalysisEvent({
      requestId,
      userEmail,
      mode: "requirements-blueprint",
      selectedLanguage: "",
      success: false,
      error: error.message
    });

    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
