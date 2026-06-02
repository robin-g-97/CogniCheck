// Main page flow for the guided report import and CogniCheck analysis page.

let uploadedFiles = [];
let backgroundContext = "";
let selectedLanguage = "English";
let reportImported = false;
let extractedDocumentText = "";
let structuredContext = {};
let analysisResult = "";
let loadingImport = false;
let loadingAnalysis = false;
let importError = "";
let analysisError = "";

const structuredFieldGroups = [
  {
    title: "Core report context",
    fields: [
      ["reportTitle", "Report title"],
      ["reportType", "Report type"],
      ["businessDomain", "Business domain"],
      ["intendedAudience", "Intended audience"],
      ["userExpertiseLevel", "User expertise level"],
      ["reportingFrequency", "Reporting frequency"],
      ["usageContext", "Usage context"]
    ]
  },
  {
    title: "Decision context",
    fields: [
      ["mainDecisionSupported", "Main decision supported"],
      ["secondaryDecisionsSupported", "Secondary decisions supported"],
      ["requiredActionFromUser", "Required action from user"],
      ["decisionUrgency", "Decision urgency"],
      ["decisionComplexity", "Decision complexity"],
      ["whatUserShouldKnow", "What should the user know after viewing the report?"]
    ]
  },
  {
    title: "KPI context",
    fields: [
      ["importantKpis", "Important KPIs"],
      ["kpiDefinitionsOrNotes", "KPI definitions or notes"],
      ["targetsThresholdsOrBenchmarks", "Targets, thresholds or benchmarks"],
      ["timePeriodShown", "Time period shown"],
      ["comparisonLogic", "Comparison logic"]
    ]
  },
  {
    title: "Cognitive and business concerns",
    fields: [
      ["knownConcernsOrRisks", "Known concerns or risks"],
      ["possibleUserConfusion", "Possible user confusion"],
      ["missingContext", "Missing context"],
      ["assumptionsDetected", "Assumptions detected"],
      ["additionalNotes", "Additional notes"]
    ]
  }
];

const analysisLabels = {
  English: {
    resultTitle: "CogniCheck analysis result",
    totalScore: "Total score",
    score: "Score",
    maturityLevel: "Maturity level",
    mostImportantIssue: "Most important issue",
    mostImportantImprovement: "Most important improvement",
    printReport: "Print Report",
    executiveVerdict: "1. Executive verdict",
    sections: {
      cognitiveLoad: "2. Cognitive load",
      decisionAlignment: "3. Decision alignment",
      psychologicalLens: "4. Psychological lens",
      topRecommendations: "5. Top recommendations",
      missingContext: "6. Missing context"
    },
    keyPoints: "Key points",
    whyItMatters: "Why it matters",
    noMajorMissingContext: "No major missing context detected.",
    notScored: "Not scored",
    statusLabels: {
      strong: "Strong",
      needsRefinement: "Needs refinement",
      needsAttention: "Needs attention",
      lowConcern: "Low concern",
      moderateConcern: "Moderate concern",
      highConcern: "High concern"
    }
  },
  Dutch: {
    resultTitle: "CogniCheck analyseresultaat",
    totalScore: "Totaalscore",
    score: "Score",
    maturityLevel: "Volwassenheidsniveau",
    mostImportantIssue: "Belangrijkste issue",
    mostImportantImprovement: "Belangrijkste verbetering",
    printReport: "Print rapport",
    executiveVerdict: "1. Eindoordeel",
    sections: {
      cognitiveLoad: "2. Cognitieve belasting",
      decisionAlignment: "3. Beslissingsondersteuning",
      psychologicalLens: "4. Psychologische lens",
      topRecommendations: "5. Topaanbevelingen",
      missingContext: "6. Ontbrekende context"
    },
    keyPoints: "Kernpunten",
    whyItMatters: "Waarom dit belangrijk is",
    noMajorMissingContext: "Geen belangrijke ontbrekende context gevonden.",
    notScored: "Geen score",
    statusLabels: {
      strong: "Sterk",
      needsRefinement: "Aanscherping nodig",
      needsAttention: "Aandacht nodig",
      lowConcern: "Laag aandachtspunt",
      moderateConcern: "Matig aandachtspunt",
      highConcern: "Hoog aandachtspunt"
    }
  }
};

const concernScoreSections = new Set(["cognitive_load"]);

// Reads supporting files. TXT is extracted in the browser; PDF and DOCX are experimental Gemini attachments.
// TODO: Add local PDF text extraction when a PDF parser dependency is introduced.
// TODO: Add local DOCX text extraction when a DOCX parser dependency is introduced.
// TODO: Add XLSX support later if KPI spreadsheets become common input.
async function handleSupportingFileUpload(event) {
  const files = Array.from(event.target.files || []);
  const supportedTypes = new Set([
    "text/plain",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ]);

  uploadedFiles = [];
  extractedDocumentText = "";

  for (const file of files) {
    if (!supportedTypes.has(file.type) && !file.name.match(/\.(txt|pdf|docx)$/i)) {
      continue;
    }

    const dataUrl = await readFileAsDataUrl(file);
    const uploadedFile = {
      fileName: file.name,
      mimeType: file.type || inferMimeType(file.name),
      base64: dataUrl.split(",")[1]
    };

    uploadedFiles.push(uploadedFile);

    if (uploadedFile.mimeType === "text/plain" || file.name.match(/\.txt$/i)) {
      const text = await readFileAsText(file);
      extractedDocumentText += `\n\n--- ${file.name} ---\n${text}`;
    }
  }

  const summary = document.getElementById("supporting-file-summary");
  summary.innerText = uploadedFiles.length
    ? `${uploadedFiles.length} supporting file(s) ready. Text was extracted from .txt files; PDF and DOCX files will be sent to the AI as attachments.`
    : "";
}

// Keeps the free background context state in sync with the textarea.
function handleBackgroundContextChange(event) {
  backgroundContext = event.target.value;
}

// Keeps the selected output language state in sync with the dropdown.
function handleLanguageChange(event) {
  selectedLanguage = event.target.value;
}

// Calls the import/context extraction AI step and shows editable structured fields.
async function importReport() {
  try {
    if (!uploadedImage) {
      alert("Please upload a report screenshot first.");
      return;
    }

    loadingImport = true;
    importError = "";
    document.getElementById("import-error").innerText = "";
    setImportLoadingState();

    const isReport = await checkIsReport(uploadedImage.dataUrl);
    if (!isReport) {
      throw new Error("This does not appear to be a report. Upload a dashboard or report.");
    }

    const data = await postJson("/api/analyze-report", {
      mode: "import",
      image: {
        base64: uploadedImage.base64,
        mimeType: uploadedImage.mimeType
      },
      supportingFiles: uploadedFiles,
      selectedLanguage,
      backgroundContext,
      extractedDocumentText
    });

    const rawOutput = getGeminiText(data);
    structuredContext = normalizeStructuredContext(safeParseJsonResponse(rawOutput));
    reportImported = true;

    lockBackgroundContext();
    renderStructuredContextFields();
    setAnalysisInstruction("Structured context is ready. Review the fields on the left, then run the full CogniCheck analysis.");
  } catch (error) {
    console.error("Import failed:", error);
    importError = error.message;
    document.getElementById("import-error").innerText = getImportErrorMessage(error);
  } finally {
    loadingImport = false;
    setImportLoadingState();
  }
}

// Updates one editable structured context field after the user changes it.
function updateStructuredContextField(fieldName, value) {
  structuredContext[fieldName] = value;
}

// Calls the final CogniCheck analysis with the image, original context, documents and corrected fields.
async function performCogniCheckAnalysis() {
  try {
    if (!reportImported) {
      alert("Please import the report before running the full analysis.");
      return;
    }

    loadingAnalysis = true;
    analysisError = "";
    document.getElementById("analysis-error").innerText = "";
    setAnalysisLoadingState();

    const data = await postJson("/api/analyze-report", {
      mode: "analysis",
      image: {
        base64: uploadedImage.base64,
        mimeType: uploadedImage.mimeType
      },
      supportingFiles: uploadedFiles,
      selectedLanguage,
      backgroundContext,
      extractedDocumentText,
      structuredContext
    });

    analysisResult = safeParseJsonResponse(getGeminiText(data));
    renderAnalysisResult(analysisResult);
  } catch (error) {
    console.error("Analysis failed:", error);
    analysisError = error.message;
    const userMessage = getAnalysisErrorMessage(error);
    document.getElementById("analysis-error").innerText = userMessage;
    setAnalysisInstruction(userMessage);
  } finally {
    loadingAnalysis = false;
    setAnalysisLoadingState();
  }
}

function renderStructuredContextFields() {
  const container = document.getElementById("structured-context-container");
  const fieldsContainer = document.getElementById("structured-context-fields");

  fieldsContainer.innerHTML = structuredFieldGroups.map(group => `
    <fieldset class="structured-group">
      <legend>${group.title}</legend>
      ${group.fields.map(([fieldName, label]) => `
        <div class="form-field">
          <label for="${fieldName}">${label}</label>
          <textarea id="${fieldName}" rows="2" oninput="updateStructuredContextField('${fieldName}', this.value)">${escapeHtml(structuredContext[fieldName] || "")}</textarea>
        </div>
      `).join("")}
    </fieldset>
  `).join("");

  container.style.display = "block";
}

// Renders the short JSON-only final analysis format.
function renderAnalysisResult(result) {
  const report = document.getElementById("analysis-report");
  const labels = getAnalysisLabels();
  const printButton = document.getElementById("print-report");

  printButton.innerText = labels.printReport;
  printButton.style.display = "inline-flex";

  report.innerHTML = `
    <h2>${escapeHtml(labels.resultTitle)}</h2>
    <div class="analysis-result-text">
      ${renderExecutiveVerdict(result.executive_verdict, labels)}
      ${renderScoredSection(labels.sections.cognitiveLoad, result.cognitive_load, labels, "cognitive_load")}
      ${renderScoredSection(labels.sections.decisionAlignment, result.decision_alignment, labels, "decision_alignment")}
      ${renderInsightSection(labels.sections.psychologicalLens, result.psychological_lens, labels)}
      ${renderRecommendations(result.top_recommendations, labels)}
      ${renderMissingContext(result.missing_context, labels)}
    </div>
  `;
}

function setImportLoadingState() {
  const button = document.getElementById("import-button");
  button.disabled = loadingImport;
  button.innerText = loadingImport ? "Importing report..." : "Import report";
}

function setAnalysisLoadingState() {
  const button = document.getElementById("analyze-button");
  if (button) {
    button.disabled = loadingAnalysis;
    button.innerText = loadingAnalysis ? "Analyzing..." : "Perform CogniCheck Analysis";
  }

  if (loadingAnalysis) {
    setAnalysisInstruction("Analyzing report, please wait...");
  }
}

function setAnalysisInstruction(message) {
  const report = document.getElementById("analysis-report");
  report.innerHTML = `<h2>Analysis output</h2><p>${escapeHtml(message)}</p>`;
}

function lockBackgroundContext() {
  const textarea = document.getElementById("backgroundContext");
  textarea.readOnly = true;
  textarea.classList.add("readonly-context");
}

function emptyStructuredContext() {
  return Object.fromEntries(
    structuredFieldGroups.flatMap(group => group.fields).map(([fieldName]) => [fieldName, ""])
  );
}

function normalizeStructuredContext(value) {
  const normalized = emptyStructuredContext();
  Object.keys(normalized).forEach(key => {
    normalized[key] = typeof value?.[key] === "string" ? value[key] : "";
  });
  return normalized;
}

function safeParseJsonResponse(text) {
  const cleanText = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const jsonStart = cleanText.indexOf("{");
  const jsonEnd = cleanText.lastIndexOf("}");
  const jsonText = jsonStart >= 0 && jsonEnd > jsonStart
    ? cleanText.slice(jsonStart, jsonEnd + 1)
    : cleanText;

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    // AI output can occasionally contain invalid escaping even when JSON is requested.
    // Keep the UI friendly, but leave a small console preview for debugging.
    console.warn("AI JSON parse failed:", error.message, jsonText.slice(0, 500));

    const parseError = new Error(getJsonParseMessage(error));
    parseError.isJsonParseError = true;
    parseError.originalError = error;
    throw parseError;
  }
}

function getJsonParseMessage(error) {
  if (error.message.includes("Bad escaped character in JSON at position")) {
    return "The AI returned an invalid JSON response. This sometimes happens because of escaped characters. Please try again.";
  }

  return "The AI response could not be read as structured JSON. Please try again.";
}

// TODO: If JSON parsing errors remain common, consider adding a server-side JSON repair step or using stricter schema-based output.
function getImportErrorMessage(error) {
  if (error.isJsonParseError) return error.message;
  if (error.message.includes("does not appear to be a report")) return error.message;
  return "Import failed. Please check the uploaded file and try again.";
}

function getAnalysisErrorMessage(error) {
  if (error.isJsonParseError) return error.message;
  return "Analysis failed. Please try again. If this keeps happening, simplify the context or use another screenshot.";
}

function renderExecutiveVerdict(verdict = {}, labels = getAnalysisLabels()) {
  return `
    <section class="analysis-result-section analysis-summary">
      <div class="analysis-section-heading">
        <h3>${escapeHtml(labels.executiveVerdict)}</h3>
        ${renderScore(verdict.total_score, labels, "executive_verdict")}
      </div>
      ${verdict.maturity_level ? `<p><strong>${escapeHtml(labels.maturityLevel)}:</strong> ${escapeHtml(verdict.maturity_level)}</p>` : ""}
      ${verdict.verdict ? `<p>${escapeHtml(verdict.verdict)}</p>` : ""}
      ${verdict.most_important_issue ? `<p><strong>${escapeHtml(labels.mostImportantIssue)}:</strong> ${escapeHtml(verdict.most_important_issue)}</p>` : ""}
      ${verdict.most_important_improvement ? `<p><strong>${escapeHtml(labels.mostImportantImprovement)}:</strong> ${escapeHtml(verdict.most_important_improvement)}</p>` : ""}
    </section>
  `;
}

function renderScoredSection(title, section = {}, labels = getAnalysisLabels(), sectionKey = "") {
  return `
    <section class="analysis-result-section">
      <div class="analysis-section-heading">
        <h3>${escapeHtml(title)}</h3>
        ${renderScore(section.score, labels, sectionKey)}
      </div>
      ${section.assessment ? `<p>${escapeHtml(section.assessment)}</p>` : ""}
      ${renderList(labels.keyPoints, section.key_points, 3)}
    </section>
  `;
}

function renderInsightSection(title, section = {}, labels = getAnalysisLabels()) {
  return `
    <section class="analysis-result-section">
      <h3>${escapeHtml(title)}</h3>
      ${section.assessment ? `<p>${escapeHtml(section.assessment)}</p>` : ""}
      ${renderList(labels.keyPoints, section.key_points, 4)}
    </section>
  `;
}

function renderRecommendations(recommendations = [], labels = getAnalysisLabels()) {
  const safeRecommendations = Array.isArray(recommendations)
    ? recommendations.filter(item => item && typeof item === "object").slice(0, 3)
    : [];
  if (safeRecommendations.length === 0) return "";

  return `
    <section class="analysis-result-section">
      <h3>${escapeHtml(labels.sections.topRecommendations)}</h3>
      <div class="recommendation-list">
        ${safeRecommendations.map(item => `
          <div class="recommendation-item">
            <strong>${escapeHtml(item.recommendation || "")}</strong>
            ${item.why_it_matters ? `<p><strong>${escapeHtml(labels.whyItMatters)}:</strong> ${escapeHtml(item.why_it_matters)}</p>` : ""}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderMissingContext(section = {}, labels = getAnalysisLabels()) {
  const assessment = section.assessment || labels.noMajorMissingContext;

  return `
    <section class="analysis-result-section">
      <h3>${escapeHtml(labels.sections.missingContext)}</h3>
      <p>${escapeHtml(assessment)}</p>
      ${renderList(labels.keyPoints, section.items, 3)}
    </section>
  `;
}

function renderScore(score, labels, sectionKey = "") {
  const numericScore = Number(score);
  const scoreStatus = getScoreStatus(numericScore, sectionKey, labels);

  return `
    <span class="score-pill score-pill-${scoreStatus.color}">
      ${escapeHtml(scoreStatus.label)}
    </span>
  `;
}

function renderList(title, items, limit = 3) {
  const safeItems = Array.isArray(items) ? items.slice(0, limit) : [];
  if (safeItems.length === 0) return "";

  return `
    <div class="analysis-list-group">
      <strong>${escapeHtml(title)}</strong>
      <ul>
        ${safeItems.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function getAnalysisLabels() {
  return analysisLabels[selectedLanguage] || analysisLabels.English;
}

function getScoreStatus(score, sectionKey, labels) {
  if (!Number.isFinite(score)) {
    return { color: "neutral", label: labels.notScored };
  }

  if (concernScoreSections.has(sectionKey)) {
    if (score <= 3) return { color: "green", label: labels.statusLabels.lowConcern };
    if (score <= 6) return { color: "orange", label: labels.statusLabels.moderateConcern };
    return { color: "red", label: labels.statusLabels.highConcern };
  }

  if (score >= 8) return { color: "green", label: labels.statusLabels.strong };
  if (score >= 5) return { color: "orange", label: labels.statusLabels.needsRefinement };
  return { color: "red", label: labels.statusLabels.needsAttention };
}

function getGeminiText(data) {
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.log("Unexpected Gemini response:", data);
    throw new Error("Gemini did not return text.");
  }
  return text;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function inferMimeType(fileName) {
  if (fileName.match(/\.pdf$/i)) return "application/pdf";
  if (fileName.match(/\.docx$/i)) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "text/plain";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Backwards-compatible name for the previous button handler.
let analyzeImage = performCogniCheckAnalysis;

function printAnalysisReport() {
  const report = document.getElementById("analysis-report");
  if (!report || !report.innerText.trim()) {
    alert("There is no analysis report to print yet.");
    return;
  }

  window.print();
}
