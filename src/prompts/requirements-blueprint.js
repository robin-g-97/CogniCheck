function requirementsBlueprintPrompt(text) {
  const prompt = process.env.REQUIREMENTS_BLUEPRINT_PROMPT;

  if (!prompt) {
    throw new Error("Missing REQUIREMENTS_BLUEPRINT_PROMPT in .env");
  }

  if (prompt.includes("{{requirements}}")) {
    return prompt.replace("{{requirements}}", text);
  }

  return `${prompt}\n\nHere are the requirements:\n${text}`;
}

module.exports = {
  requirementsBlueprintPrompt
};
