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
    mostImportantImprovement: "Most important improvement",
    printReport: "Print Report",
    executiveSummary: "1. Executive summary",
    sections: {
      cognitiveLoad: "2. Cognitive load score",
      decisionAlignment: "3. Decision alignment score",
      contextAlignment: "4. Context alignment",
      cognitivePsychology: "5. Cognitive psychology analysis",
      decisionSupport: "6. Decision-support analysis",
      keyRisks: "7. Key risks",
      recommendations: "8. Recommendations",
      missingContext: "9. Missing context"
    },
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    improvementPoints: "Improvement points"
  },
  Dutch: {
    resultTitle: "CogniCheck analyseresultaat",
    totalScore: "Totaalscore",
    score: "Score",
    maturityLevel: "Volwassenheidsniveau",
    mostImportantImprovement: "Belangrijkste verbetering",
    printReport: "Print rapport",
    executiveSummary: "1. Managementsamenvatting",
    sections: {
      cognitiveLoad: "2. Score cognitieve belasting",
      decisionAlignment: "3. Score beslissingsondersteuning",
      contextAlignment: "4. Contextafstemming",
      cognitivePsychology: "5. Cognitief-psychologische analyse",
      decisionSupport: "6. Analyse beslissingsondersteuning",
      keyRisks: "7. Belangrijkste risico's",
      recommendations: "8. Aanbevelingen",
      missingContext: "9. Ontbrekende context"
    },
    strengths: "Sterke punten",
    weaknesses: "Zwakke punten",
    improvementPoints: "Verbeterpunten"
  }
};

// Reads supporting files. Text files are extracted in the browser; PDF and DOCX are attached to Gemini.
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
    structuredContext = normalizeStructuredContext(parseJsonResponse(rawOutput));
    reportImported = true;

    lockBackgroundContext();
    renderStructuredContextFields();
    setAnalysisInstruction("Structured context is ready. Review the fields on the left, then run the full CogniCheck analysis.");
  } catch (error) {
    console.error("Import failed:", error);
    importError = error.message;
    document.getElementById("import-error").innerText = `Import failed: ${error.message}`;
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

    analysisResult = parseJsonResponse(getGeminiText(data));
    renderAnalysisResult(analysisResult);
  } catch (error) {
    console.error("Analysis failed:", error);
    analysisError = error.message;
    document.getElementById("analysis-error").innerText = `Analysis failed: ${error.message}`;
    setAnalysisInstruction(`Analysis failed: ${error.message}`);
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

function renderAnalysisResult(result) {
  const report = document.getElementById("analysis-report");
  const labels = getAnalysisLabels();
  const printButton = document.getElementById("print-report");

  printButton.innerText = labels.printReport;
  printButton.style.display = "inline-flex";

  report.innerHTML = `
    <h2>${escapeHtml(labels.resultTitle)}</h2>
    <div class="analysis-result-text">
      ${renderExecutiveSummary(result.executive_summary, labels)}
      ${renderAnalysisSection(labels.sections.cognitiveLoad, result.cognitive_load, labels)}
      ${renderAnalysisSection(labels.sections.decisionAlignment, result.decision_alignment, labels)}
      ${renderAnalysisSection(labels.sections.contextAlignment, result.context_alignment, labels)}
      ${renderAnalysisSection(labels.sections.cognitivePsychology, result.cognitive_psychology_analysis, labels)}
      ${renderAnalysisSection(labels.sections.decisionSupport, result.decision_support_analysis, labels)}
      ${renderAnalysisSection(labels.sections.keyRisks, result.key_risks, labels)}
      ${renderAnalysisSection(labels.sections.recommendations, result.recommendations, labels)}
      ${renderAnalysisSection(labels.sections.missingContext, result.missing_context, labels)}
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

function parseJsonResponse(text) {
  const cleanText = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  if (!cleanText.startsWith("{")) {
    const jsonStart = cleanText.indexOf("{");
    const jsonEnd = cleanText.lastIndexOf("}");

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      return JSON.parse(cleanText.slice(jsonStart, jsonEnd + 1));
    }
  }

  return JSON.parse(cleanText);
}

function renderExecutiveSummary(summary = {}, labels = getAnalysisLabels()) {
  return `
    <section class="analysis-result-section analysis-summary">
      <div class="analysis-section-heading">
        <h3>${escapeHtml(labels.executiveSummary)}</h3>
        ${renderScore(summary.total_score, labels.totalScore)}
      </div>
      ${summary.maturity_level ? `<p><strong>${escapeHtml(labels.maturityLevel)}:</strong> ${escapeHtml(summary.maturity_level)}</p>` : ""}
      ${summary.summary ? `<p>${escapeHtml(summary.summary)}</p>` : ""}
      ${summary.most_important_improvement ? `<p><strong>${escapeHtml(labels.mostImportantImprovement)}:</strong> ${escapeHtml(summary.most_important_improvement)}</p>` : ""}
    </section>
  `;
}

function renderAnalysisSection(title, section = {}, labels = getAnalysisLabels()) {
  return `
    <section class="analysis-result-section">
      <div class="analysis-section-heading">
        <h3>${escapeHtml(title)}</h3>
        ${renderScore(section.score, labels.score)}
      </div>
      ${section.assessment ? `<p>${escapeHtml(section.assessment)}</p>` : ""}
      ${renderList(labels.strengths, section.strengths)}
      ${renderList(labels.weaknesses, section.weaknesses)}
      ${renderList(labels.improvementPoints, section.improvement_points)}
    </section>
  `;
}

function renderScore(score, label) {
  const numericScore = Number(score);
  const displayScore = Number.isFinite(numericScore) ? `${numericScore}/10` : "Not scored";
  return `<span class="score-pill">${escapeHtml(label)}: ${escapeHtml(displayScore)}</span>`;
}

function renderList(title, items) {
  const safeItems = Array.isArray(items) ? items.slice(0, 3) : [];
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

function formatPlainText(text) {
  const lines = escapeHtml(text).split("\n");

  // Gemini often returns Markdown. This small formatter supports the Markdown
  // patterns we ask for without adding a full Markdown library to the demo.
  return lines.map(line => {
    const trimmed = line.trim();

    if (!trimmed) {
      return "";
    }

    const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      return `<h3>${formatInlineMarkdown(headingMatch[1])}</h3>`;
    }

    const boldNumberedHeadingMatch = trimmed.match(/^\*\*(\d+\.\s+.+?)\*\*$/);
    if (boldNumberedHeadingMatch) {
      return `<h3>${formatInlineMarkdown(boldNumberedHeadingMatch[1])}</h3>`;
    }

    const numberedHeadingMatch = trimmed.match(/^(\d+\.\s+.+)$/);
    if (numberedHeadingMatch && isAnalysisSectionHeading(trimmed)) {
      return `<h3>${formatInlineMarkdown(numberedHeadingMatch[1])}</h3>`;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      return `<div class="analysis-bullet">${formatInlineMarkdown(bulletMatch[1])}</div>`;
    }

    return `<p>${formatInlineMarkdown(trimmed)}</p>`;
  }).join("");
}

function formatInlineMarkdown(text) {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function isAnalysisSectionHeading(line) {
  return [
    "1. Executive summary",
    "2. Cognitive load score, 1-10",
    "3. Decision alignment score, 1-10",
    "4. Context alignment",
    "5. Cognitive psychology analysis",
    "6. Decision-support analysis",
    "7. Key risks",
    "8. Recommendations",
    "9. Missing context"
  ].some(sectionHeading => line.toLowerCase() === sectionHeading.toLowerCase());
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
