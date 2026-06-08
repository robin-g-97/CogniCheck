// Renders the requirements-to-blueprint JSON format into a stable UI.
function renderBlueprintOutput(text = "", metadata = {}) {
  const container = document.getElementById("result-container");
  const blueprintOutput = document.getElementById("blueprintOutput");

  container.style.display = "block";

  try {
    const blueprint = safeParseBlueprintResponse(text);
    blueprintOutput.innerHTML = renderBlueprint(blueprint, metadata.selectedLanguage || "English");
  } catch (error) {
    console.error("Blueprint JSON parse failed:", error);
    blueprintOutput.innerHTML = `
      <div class="blueprint-output">
        <section class="blueprint-section blueprint-section-risk">
          <h2><span class="blueprint-indicator" aria-hidden="true"></span>Blueprint could not be rendered</h2>
          <p>The AI response was not valid structured JSON. Please try generating the blueprint again.</p>
        </section>
      </div>
    `;
  }

  renderFeedbackForm({
    containerId: "blueprint-feedback-container",
    workflow: "requirements-blueprint",
    selectedLanguage: metadata.selectedLanguage || "English",
    analysisEventId: metadata.analysisEventId || "",
    variant: "blueprint",
    scores: {}
  });
}

function renderBlueprint(blueprint = {}, selectedLanguage = "English") {
  const labels = getBlueprintLabels(selectedLanguage);

  return `
    <div class="blueprint-output">
      <section class="blueprint-section blueprint-section-decision">
        <h2><span class="blueprint-indicator" aria-hidden="true"></span>${escapeBlueprintHtml(blueprint.title || labels.title)}</h2>
        ${blueprint.summary ? `<p class="blueprint-summary">${escapeBlueprintHtml(blueprint.summary)}</p>` : ""}
        ${renderDecisionContext(blueprint.decision_context, labels)}
      </section>

      ${renderKeyRequirements(blueprint.key_requirements, labels)}
      ${renderKpiLogic(blueprint.kpi_logic, labels)}
      ${renderDashboardStructure(blueprint.dashboard_structure, labels)}
      ${renderAssumptions(blueprint.important_assumptions, labels)}
      ${renderRisks(blueprint.risks_or_ambiguities, labels)}
      ${renderFollowUpQuestions(blueprint.follow_up_questions, labels)}
      ${renderNextStep(blueprint.suggested_next_step, labels)}
    </div>
  `;
}

function renderDecisionContext(context = {}, labels) {
  const items = [
    [labels.primaryDecision, context.primary_decision],
    [labels.audience, context.audience],
    [labels.workflowUse, context.workflow_use],
    [labels.urgency, context.decision_urgency]
  ].filter(([, value]) => value);

  if (items.length === 0) return "";

  return `
    <dl class="blueprint-fact-grid">
      ${items.map(([label, value]) => `
        <div>
          <dt>${escapeBlueprintHtml(label)}</dt>
          <dd>${escapeBlueprintHtml(value)}</dd>
        </div>
      `).join("")}
    </dl>
  `;
}

function renderKeyRequirements(requirements = [], labels) {
  const safeRequirements = asArray(requirements).slice(0, 10);
  if (safeRequirements.length === 0) return "";

  return `
    <section class="blueprint-section blueprint-section-default">
      <h2><span class="blueprint-indicator" aria-hidden="true"></span>${escapeBlueprintHtml(labels.keyRequirements)}</h2>
      <div class="blueprint-card-list">
        ${safeRequirements.map(item => `
          <article class="blueprint-mini-card">
            <strong>${escapeBlueprintHtml(item.label || labels.requirement)}</strong>
            <p>${escapeBlueprintHtml(item.detail || "")}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderKpiLogic(kpis = [], labels) {
  const safeKpis = asArray(kpis).slice(0, 8);
  if (safeKpis.length === 0) return "";

  return `
    <section class="blueprint-section blueprint-section-metric">
      <h2><span class="blueprint-indicator" aria-hidden="true"></span>${escapeBlueprintHtml(labels.kpiLogic)}</h2>
      <div class="blueprint-table">
        ${safeKpis.map(kpi => `
          <article>
            <div class="blueprint-row-heading">
              <strong>${escapeBlueprintHtml(kpi.name || labels.metric)}</strong>
              ${kpi.status ? `<span class="blueprint-status">${escapeBlueprintHtml(kpi.status)}</span>` : ""}
            </div>
            ${kpi.definition ? `<p>${escapeBlueprintHtml(kpi.definition)}</p>` : ""}
            ${kpi.grain ? `<small>${escapeBlueprintHtml(labels.grain)}: ${escapeBlueprintHtml(kpi.grain)}</small>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDashboardStructure(sections = [], labels) {
  const safeSections = asArray(sections).slice(0, 8);
  if (safeSections.length === 0) return "";

  return `
    <section class="blueprint-section blueprint-section-structure">
      <h2><span class="blueprint-indicator" aria-hidden="true"></span>${escapeBlueprintHtml(labels.dashboardStructure)}</h2>
      <div class="blueprint-card-list">
        ${safeSections.map(section => `
          <article class="blueprint-mini-card">
            <strong>${escapeBlueprintHtml(section.section || labels.section)}</strong>
            ${section.purpose ? `<p>${escapeBlueprintHtml(section.purpose)}</p>` : ""}
            ${renderSimpleList(section.visuals, 5)}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderAssumptions(assumptions = [], labels) {
  const safeAssumptions = asArray(assumptions).slice(0, 8);
  if (safeAssumptions.length === 0) return "";

  return `
    <section class="blueprint-section blueprint-section-assumption">
      <h2><span class="blueprint-indicator" aria-hidden="true"></span>${escapeBlueprintHtml(labels.assumptions)}</h2>
      <div class="blueprint-card-list">
        ${safeAssumptions.map(item => `
          <article class="blueprint-mini-card">
            <strong>${escapeBlueprintHtml(item.assumption || "")}</strong>
            ${item.why_it_matters ? `<p>${escapeBlueprintHtml(item.why_it_matters)}</p>` : ""}
            ${item.validation_question ? `<small>${escapeBlueprintHtml(labels.validationQuestion)}: ${escapeBlueprintHtml(item.validation_question)}</small>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderRisks(risks = [], labels) {
  const safeRisks = asArray(risks).slice(0, 8);
  if (safeRisks.length === 0) return "";

  return `
    <section class="blueprint-section blueprint-section-risk">
      <h2><span class="blueprint-indicator" aria-hidden="true"></span>${escapeBlueprintHtml(labels.risks)}</h2>
      <div class="blueprint-card-list">
        ${safeRisks.map(item => `
          <article class="blueprint-mini-card">
            <strong>${escapeBlueprintHtml(item.risk || "")}</strong>
            ${item.impact ? `<p>${escapeBlueprintHtml(item.impact)}</p>` : ""}
            ${item.mitigation ? `<small>${escapeBlueprintHtml(labels.mitigation)}: ${escapeBlueprintHtml(item.mitigation)}</small>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderFollowUpQuestions(questions = [], labels) {
  const safeQuestions = asArray(questions).slice(0, 8);
  if (safeQuestions.length === 0) return "";

  return `
    <section class="blueprint-section blueprint-section-question">
      <h2><span class="blueprint-indicator" aria-hidden="true"></span>${escapeBlueprintHtml(labels.followUpQuestions)}</h2>
      ${renderSimpleList(safeQuestions, 8)}
    </section>
  `;
}

function renderNextStep(nextStep = "", labels) {
  if (!nextStep) return "";

  return `
    <section class="blueprint-section blueprint-section-decision">
      <h2><span class="blueprint-indicator" aria-hidden="true"></span>${escapeBlueprintHtml(labels.nextStep)}</h2>
      <p>${escapeBlueprintHtml(nextStep)}</p>
    </section>
  `;
}

function renderSimpleList(items = [], limit = 5) {
  const safeItems = asArray(items).slice(0, limit);
  if (safeItems.length === 0) return "";

  return `
    <ul>
      ${safeItems.map(item => `<li>${escapeBlueprintHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function safeParseBlueprintResponse(text) {
  const cleanText = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const jsonStart = cleanText.indexOf("{");
  const jsonEnd = cleanText.lastIndexOf("}");
  const jsonText = jsonStart >= 0 && jsonEnd > jsonStart
    ? cleanText.slice(jsonStart, jsonEnd + 1)
    : cleanText;

  return JSON.parse(jsonText);
}

function getBlueprintLabels(selectedLanguage) {
  if (selectedLanguage === "Dutch") {
    return {
      title: "Dashboardblueprint",
      primaryDecision: "Primaire beslissing",
      audience: "Doelgroep",
      workflowUse: "Gebruik in workflow",
      urgency: "Urgentie",
      keyRequirements: "Belangrijkste requirements",
      requirement: "Requirement",
      kpiLogic: "KPI- en metriclogica",
      metric: "Metric",
      grain: "Granulariteit",
      dashboardStructure: "Dashboardstructuur",
      section: "Sectie",
      assumptions: "Belangrijke aannames",
      validationQuestion: "Validatievraag",
      risks: "Risico's en ambiguiteiten",
      mitigation: "Mitigatie",
      followUpQuestions: "Vervolgvragen",
      nextStep: "Aanbevolen volgende stap"
    };
  }

  return {
    title: "Dashboard blueprint",
    primaryDecision: "Primary decision",
    audience: "Audience",
    workflowUse: "Workflow use",
    urgency: "Urgency",
    keyRequirements: "Key requirements",
    requirement: "Requirement",
    kpiLogic: "KPI and metric logic",
    metric: "Metric",
    grain: "Grain",
    dashboardStructure: "Dashboard structure",
    section: "Section",
    assumptions: "Important assumptions",
    validationQuestion: "Validation question",
    risks: "Risks and ambiguities",
    mitigation: "Mitigation",
    followUpQuestions: "Follow-up questions",
    nextStep: "Suggested next step"
  };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function escapeBlueprintHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
