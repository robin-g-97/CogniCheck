const feedbackLabels = {
  English: {
    title: "Help improve CogniCheck",
    intro: "Your feedback helps calibrate CogniCheck's scoring, usefulness and decision-support quality.",
    blueprintIntro: "Your feedback helps improve CogniCheck's blueprint quality, assumptions, questions and workflow usefulness.",
    usefulness: "Was this analysis useful?",
    blueprintUsefulness: "Was this blueprint useful?",
    usefulnessLow: "1 = not useful",
    usefulnessHigh: "5 = very useful",
    scoresFair: "Were the scores fair?",
    cognitiveLoadScore: "Cognitive load score",
    decisionAlignmentScore: "Decision alignment score",
    overallScore: "Overall score",
    tooLow: "Too low",
    aboutRight: "About right",
    tooHigh: "Too high",
    mainIssue: "Did CogniCheck identify the right main issue?",
    mainIssueComment: "What did it miss or overemphasize?",
    recommendation: "Was the most important recommendation actionable?",
    recommendationComment: "How could the recommendation be improved?",
    context: "Did the analysis match your report context?",
    contextComment: "What context did CogniCheck misunderstand?",
    workflow: "Would you use this in a real BI workflow?",
    blueprintContext: "Did the blueprint match the requirements context?",
    blueprintContextComment: "What requirement or context did CogniCheck misunderstand?",
    blueprintAssumptions: "Were the assumptions and follow-up questions useful?",
    blueprintAssumptionsComment: "Which assumption or question should be improved?",
    blueprintRecommendation: "Was the blueprint actionable for dashboard design?",
    blueprintRecommendationComment: "How could the blueprint be made more actionable?",
    blueprintWorkflow: "Would you use this in a real BI intake workflow?",
    workflowComment: "Where would this be most useful?",
    general: "Any other feedback?",
    yes: "Yes",
    partly: "Partly",
    no: "No",
    somewhat: "Somewhat",
    maybe: "Maybe",
    submit: "Save feedback",
    saved: "Thanks, your feedback has been saved.",
    failed: "Feedback could not be saved. Please try again."
  },
  Dutch: {
    title: "Help CogniCheck verbeteren",
    intro: "Je feedback helpt CogniCheck om scoring, bruikbaarheid en beslissingsondersteuning beter te kalibreren.",
    blueprintIntro: "Je feedback helpt CogniCheck om de kwaliteit van blueprints, aannames, vragen en workflowwaarde te verbeteren.",
    usefulness: "Was deze analyse nuttig?",
    blueprintUsefulness: "Was deze blueprint nuttig?",
    usefulnessLow: "1 = niet nuttig",
    usefulnessHigh: "5 = zeer nuttig",
    scoresFair: "Waren de scores eerlijk?",
    cognitiveLoadScore: "Score voor cognitieve belasting",
    decisionAlignmentScore: "Score voor beslissingsondersteuning",
    overallScore: "Totaalscore",
    tooLow: "Te laag",
    aboutRight: "Ongeveer goed",
    tooHigh: "Te hoog",
    mainIssue: "Heeft CogniCheck het juiste belangrijkste probleem gevonden?",
    mainIssueComment: "Wat miste de analyse of benadrukte die te veel?",
    recommendation: "Was de belangrijkste aanbeveling uitvoerbaar?",
    recommendationComment: "Hoe kan de aanbeveling worden verbeterd?",
    context: "Paste de analyse bij de context van je rapport?",
    contextComment: "Welke context heeft CogniCheck verkeerd begrepen?",
    workflow: "Zou je dit gebruiken in een echte BI-workflow?",
    blueprintContext: "Paste de blueprint bij de requirements-context?",
    blueprintContextComment: "Welke requirement of context heeft CogniCheck verkeerd begrepen?",
    blueprintAssumptions: "Waren de aannames en vervolgvragen nuttig?",
    blueprintAssumptionsComment: "Welke aanname of vraag moet worden verbeterd?",
    blueprintRecommendation: "Was de blueprint uitvoerbaar voor dashboardontwerp?",
    blueprintRecommendationComment: "Hoe kan de blueprint concreter worden?",
    blueprintWorkflow: "Zou je dit gebruiken in een echte BI-intakeworkflow?",
    workflowComment: "Waar zou dit het meest nuttig zijn?",
    general: "Nog andere feedback?",
    yes: "Ja",
    partly: "Gedeeltelijk",
    no: "Nee",
    somewhat: "Enigszins",
    maybe: "Misschien",
    submit: "Feedback opslaan",
    saved: "Bedankt, je feedback is opgeslagen.",
    failed: "Feedback kon niet worden opgeslagen. Probeer het opnieuw."
  }
};

function renderFeedbackForm({
  containerId,
  workflow,
  selectedLanguage = window.CogniCheckI18n?.getLanguage() || "Dutch",
  scores = {},
  analysisEventId = "",
  variant = "analysis"
}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const labels = feedbackLabels[selectedLanguage] || feedbackLabels.English;
  const isBlueprint = variant === "blueprint";
  const formId = `${containerId}-form`;
  const statusId = `${containerId}-status`;

  container.innerHTML = `
    <details class="feedback-panel" open>
      <summary>${escapeFeedbackHtml(labels.title)}</summary>
      <form id="${escapeFeedbackHtml(formId)}" class="feedback-form">
        <p class="feedback-intro">${escapeFeedbackHtml(isBlueprint ? labels.blueprintIntro : labels.intro)}</p>

        <fieldset>
          <legend>${escapeFeedbackHtml(isBlueprint ? labels.blueprintUsefulness : labels.usefulness)}</legend>
          <div class="feedback-rating">
            ${[1, 2, 3, 4, 5].map(value => `
              <label>
                <input type="radio" name="usefulness_rating" value="${value}">
                <span>${value}</span>
              </label>
            `).join("")}
          </div>
          <div class="feedback-scale-labels">
            <span>${escapeFeedbackHtml(labels.usefulnessLow)}</span>
            <span>${escapeFeedbackHtml(labels.usefulnessHigh)}</span>
          </div>
        </fieldset>

        ${isBlueprint ? renderBlueprintFeedbackQuestions(labels) : renderAnalysisFeedbackQuestions(labels)}
        ${renderFeedbackTextarea("workflow_comment", labels.workflowComment)}
        ${renderFeedbackTextarea("free_text_feedback", labels.general)}

        <button type="submit" class="button feedback-submit">${escapeFeedbackHtml(labels.submit)}</button>
        <p id="${escapeFeedbackHtml(statusId)}" class="feedback-status"></p>
      </form>
    </details>
  `;

  document.getElementById(formId).addEventListener("submit", event => {
    submitFeedback(event, {
      workflow,
      selectedLanguage,
      scores,
      analysisEventId,
      variant,
      labels,
      statusId
    });
  });
}

function renderAnalysisFeedbackQuestions(labels) {
  return `
    <fieldset>
      <legend>${escapeFeedbackHtml(labels.scoresFair)}</legend>
      ${renderFeedbackSelect("cognitive_load_score_feedback", labels.cognitiveLoadScore, labels)}
      ${renderFeedbackSelect("decision_alignment_score_feedback", labels.decisionAlignmentScore, labels)}
      ${renderFeedbackSelect("overall_score_feedback", labels.overallScore, labels)}
    </fieldset>

    ${renderChoiceGroup("main_issue_feedback", labels.mainIssue, [labels.yes, labels.partly, labels.no])}
    ${renderFeedbackTextarea("main_issue_comment", labels.mainIssueComment)}

    ${renderChoiceGroup("recommendation_actionability", labels.recommendation, [labels.yes, labels.somewhat, labels.no])}
    ${renderFeedbackTextarea("recommendation_comment", labels.recommendationComment)}

    ${renderChoiceGroup("context_match", labels.context, [labels.yes, labels.partly, labels.no])}
    ${renderFeedbackTextarea("context_comment", labels.contextComment)}

    ${renderChoiceGroup("real_workflow_use", labels.workflow, [labels.yes, labels.maybe, labels.no])}
  `;
}

function renderBlueprintFeedbackQuestions(labels) {
  return `
    ${renderChoiceGroup("context_match", labels.blueprintContext, [labels.yes, labels.partly, labels.no])}
    ${renderFeedbackTextarea("context_comment", labels.blueprintContextComment)}

    ${renderChoiceGroup("main_issue_feedback", labels.blueprintAssumptions, [labels.yes, labels.partly, labels.no])}
    ${renderFeedbackTextarea("main_issue_comment", labels.blueprintAssumptionsComment)}

    ${renderChoiceGroup("recommendation_actionability", labels.blueprintRecommendation, [labels.yes, labels.somewhat, labels.no])}
    ${renderFeedbackTextarea("recommendation_comment", labels.blueprintRecommendationComment)}

    ${renderChoiceGroup("real_workflow_use", labels.blueprintWorkflow, [labels.yes, labels.maybe, labels.no])}
  `;
}

function renderFeedbackSelect(name, label, labels) {
  return `
    <label class="feedback-field">
      <span>${escapeFeedbackHtml(label)}</span>
      <select name="${escapeFeedbackHtml(name)}">
        <option value=""></option>
        <option value="Too low">${escapeFeedbackHtml(labels.tooLow)}</option>
        <option value="About right">${escapeFeedbackHtml(labels.aboutRight)}</option>
        <option value="Too high">${escapeFeedbackHtml(labels.tooHigh)}</option>
      </select>
    </label>
  `;
}

function renderChoiceGroup(name, legend, options) {
  return `
    <fieldset>
      <legend>${escapeFeedbackHtml(legend)}</legend>
      <div class="feedback-choice-row">
        ${options.map(option => `
          <label>
            <input type="radio" name="${escapeFeedbackHtml(name)}" value="${escapeFeedbackHtml(option)}">
            <span>${escapeFeedbackHtml(option)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `;
}

function renderFeedbackTextarea(name, placeholder) {
  return `
    <label class="feedback-field">
      <span>${escapeFeedbackHtml(placeholder)}</span>
      <textarea name="${escapeFeedbackHtml(name)}" rows="2"></textarea>
    </label>
  `;
}

async function submitFeedback(event, context) {
  event.preventDefault();

  const form = event.target;
  const status = document.getElementById(context.statusId);
  const submitButton = form.querySelector("button[type='submit']");
  const formData = new FormData(form);

  submitButton.disabled = true;
  status.className = "feedback-status";
  status.innerText = "";

  try {
    await postJson("/api/analysis-feedback", {
      workflow: context.workflow,
      analysis_event_id: context.analysisEventId,
      selected_language: context.selectedLanguage,
      cognitive_load_score: context.scores.cognitiveLoadScore ?? null,
      decision_alignment_score: context.scores.decisionAlignmentScore ?? null,
      overall_score: context.scores.overallScore ?? null,
      usefulness_rating: formData.get("usefulness_rating") || null,
      cognitive_load_score_feedback: formData.get("cognitive_load_score_feedback") || "",
      decision_alignment_score_feedback: formData.get("decision_alignment_score_feedback") || "",
      overall_score_feedback: formData.get("overall_score_feedback") || "",
      main_issue_feedback: formData.get("main_issue_feedback") || "",
      main_issue_comment: formData.get("main_issue_comment") || "",
      recommendation_actionability: formData.get("recommendation_actionability") || "",
      recommendation_comment: formData.get("recommendation_comment") || "",
      context_match: formData.get("context_match") || "",
      context_comment: formData.get("context_comment") || "",
      real_workflow_use: formData.get("real_workflow_use") || "",
      workflow_comment: formData.get("workflow_comment") || "",
      free_text_feedback: formData.get("free_text_feedback") || ""
    });

    status.classList.add("feedback-status-success");
    status.innerText = context.labels.saved;
  } catch (error) {
    console.error("Feedback save failed:", error);
    status.classList.add("feedback-status-error");
    status.innerText = context.labels.failed;
    submitButton.disabled = false;
  }
}

function escapeFeedbackHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
