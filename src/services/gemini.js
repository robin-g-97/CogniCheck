const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

function getGeminiModel(model) {
  return model || DEFAULT_GEMINI_MODEL;
}

async function callGemini({ parts, generationConfig, model }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const geminiModel = getGeminiModel(model);

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in .env");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        ...(generationConfig && { generationConfig })
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini request failed");
  }

  return data;
}

function extractGeminiText(data) {
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

module.exports = {
  callGemini,
  extractGeminiText,
  getGeminiModel
};
