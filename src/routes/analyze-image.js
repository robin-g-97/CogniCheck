const express = require("express");
const { callGemini } = require("../services/gemini");

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

router.get("/analysisprompt", (req, res) => {
  res.json({
    prompt: process.env.ANALYSIS_PROMPT || "Default prompt if not set in .env"
  });
});

module.exports = router;
