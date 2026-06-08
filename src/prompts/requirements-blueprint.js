function requirementsBlueprintPrompt(text, selectedLanguage = "English") {
  const prompt = process.env.REQUIREMENTS_BLUEPRINT_PROMPT;

  if (!prompt) {
    throw new Error("Missing REQUIREMENTS_BLUEPRINT_PROMPT in .env");
  }

  const outputLanguage = selectedLanguage === "Dutch" ? "Dutch" : "English";
  const languageInstruction = `\n\nWrite every user-facing value in ${outputLanguage}.`;
  const formatInstruction = `

Return one valid JSON object only. Do not return markdown, HTML, comments, or code fences.
The JSON must follow this exact shape:
{
  "title": "short blueprint title",
  "summary": "2-3 sentence concise summary of what should be built and why",
  "decision_context": {
    "primary_decision": "the main decision the dashboard/report should support",
    "audience": "main users or stakeholder groups",
    "workflow_use": "where this output fits in the BI/business workflow",
    "decision_urgency": "low, medium, high, or unknown"
  },
  "key_requirements": [
    { "label": "short requirement label", "detail": "specific requirement detail" }
  ],
  "kpi_logic": [
    {
      "name": "KPI or metric name",
      "definition": "definition if known, otherwise say what is missing",
      "grain": "time/entity grain if known",
      "status": "clear, needs definition, or assumption"
    }
  ],
  "dashboard_structure": [
    {
      "section": "dashboard section name",
      "purpose": "why this section is needed",
      "visuals": ["recommended visual or component"]
    }
  ],
  "important_assumptions": [
    {
      "assumption": "unchecked assumption",
      "why_it_matters": "why it affects the dashboard or decision",
      "validation_question": "question to validate it"
    }
  ],
  "risks_or_ambiguities": [
    {
      "risk": "risk or ambiguity",
      "impact": "likely impact",
      "mitigation": "practical next mitigation"
    }
  ],
  "follow_up_questions": ["specific stakeholder question"],
  "suggested_next_step": "single practical next step"
}

Keep the output concise and decision-oriented. Do not write a full implementation manual.
Prefer concrete BI language over generic dashboard advice.
If a field is unknown, say that it is unknown or needs definition instead of inventing details.`;

  if (prompt.includes("{{requirements}}")) {
    return `${prompt.replace("{{requirements}}", text)}${languageInstruction}${formatInstruction}`;
  }

  return `${prompt}${languageInstruction}${formatInstruction}\n\nHere are the requirements:\n${text}`;
}

module.exports = {
  requirementsBlueprintPrompt
};
