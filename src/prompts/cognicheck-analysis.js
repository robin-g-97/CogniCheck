const fs = require("fs");
const path = require("path");

const promptPath = path.join(__dirname, "cognicheck-analysis-prompt.txt");

const structuredContextKeys = [
  "reportTitle",
  "reportType",
  "businessDomain",
  "intendedAudience",
  "userExpertiseLevel",
  "reportingFrequency",
  "usageContext",
  "mainDecisionSupported",
  "secondaryDecisionsSupported",
  "requiredActionFromUser",
  "decisionUrgency",
  "decisionComplexity",
  "whatUserShouldKnow",
  "importantKpis",
  "kpiDefinitionsOrNotes",
  "targetsThresholdsOrBenchmarks",
  "timePeriodShown",
  "comparisonLogic",
  "knownConcernsOrRisks",
  "possibleUserConfusion",
  "missingContext",
  "assumptionsDetected",
  "additionalNotes"
];

function emptyStructuredContext() {
  return Object.fromEntries(structuredContextKeys.map(key => [key, ""]));
}

function fillPromptTemplate(template, values) {
  return Object.entries(values).reduce((filledTemplate, [key, value]) => {
    return filledTemplate.replaceAll(`{{${key}}}`, value);
  }, template);
}

function buildImportPrompt({ selectedLanguage, backgroundContext, extractedDocumentText }) {
  return `
Use the uploaded report screenshot, the user's background context and any extracted supporting document text to draft structured report context fields.

Priority order:
1. User-provided background context
2. Supporting document text
3. Image inference

Do not invent information. If unknown, return an empty value. Write all generated fields in ${selectedLanguage}.

User-provided background context:
${backgroundContext || "(none provided)"}

Extracted supporting document text:
${extractedDocumentText?.trim() || "(no text extracted; PDF and DOCX files may be attached separately)"}

Return only valid JSON with these exact keys:
${JSON.stringify(emptyStructuredContext(), null, 2)}
`;
}

function buildFinalAnalysisPrompt({
  selectedLanguage,
  backgroundContext,
  extractedDocumentText,
  structuredContext
}) {
  // The long analysis prompt lives outside /public so users cannot fetch it in DevTools.
  const template = fs.readFileSync(promptPath, "utf8");

  return fillPromptTemplate(template, {
    selectedLanguage,
    backgroundContext: backgroundContext || "(none provided)",
    extractedDocumentText: extractedDocumentText?.trim() || "(no text extracted; PDF and DOCX files may be attached separately)",
    structuredContext: JSON.stringify(structuredContext || emptyStructuredContext(), null, 2)
  });
}

module.exports = {
  buildFinalAnalysisPrompt,
  buildImportPrompt
};
