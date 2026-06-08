const express = require("express");
const { storeAnalysisFeedback } = require("../services/analytics-db");

const router = express.Router();

router.post("/api/analysis-feedback", async (req, res) => {
  try {
    const feedback = req.body || {};

    const result = await storeAnalysisFeedback({
      analysisEventId: cleanText(feedback.analysis_event_id),
      userEmail: req.sessionEmail || "",
      workflow: cleanText(feedback.workflow),
      selectedLanguage: cleanText(feedback.selected_language),
      cognitiveLoadScore: feedback.cognitive_load_score,
      decisionAlignmentScore: feedback.decision_alignment_score,
      overallScore: feedback.overall_score,
      usefulnessRating: feedback.usefulness_rating,
      cognitiveLoadScoreFeedback: cleanText(feedback.cognitive_load_score_feedback),
      decisionAlignmentScoreFeedback: cleanText(feedback.decision_alignment_score_feedback),
      overallScoreFeedback: cleanText(feedback.overall_score_feedback),
      mainIssueFeedback: cleanText(feedback.main_issue_feedback),
      mainIssueComment: cleanText(feedback.main_issue_comment),
      recommendationActionability: cleanText(feedback.recommendation_actionability),
      recommendationComment: cleanText(feedback.recommendation_comment),
      contextMatch: cleanText(feedback.context_match),
      contextComment: cleanText(feedback.context_comment),
      realWorkflowUse: cleanText(feedback.real_workflow_use),
      workflowComment: cleanText(feedback.workflow_comment),
      freeTextFeedback: cleanText(feedback.free_text_feedback)
    });

    res.json({ success: true, stored: result.stored });
  } catch (error) {
    console.warn("Feedback save failed:", error.message);
    res.status(500).json({ error: "Feedback could not be saved. Please try again." });
  }
});

function cleanText(value = "") {
  return String(value || "").trim().slice(0, 4000);
}

module.exports = router;
