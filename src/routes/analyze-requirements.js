const express = require("express");
const { callGemini, extractGeminiText } = require("../services/gemini");
const { requirementsBlueprintPrompt } = require("../prompts/requirements-blueprint");

const router = express.Router();

router.post("/api/analyze-requirements", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing requirements text." });
  }

  try {
    const data = await callGemini({
      parts: [{ text: requirementsBlueprintPrompt(text) }]
    });

    const message = extractGeminiText(data);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
