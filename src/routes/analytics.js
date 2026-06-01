const express = require("express");
const {
  getAnalyticsSummary,
  getStoredPrompts
} = require("../services/analytics-db");

const router = express.Router();

router.get("/api/analytics/summary", async (req, res) => {
  res.json(await getAnalyticsSummary());
});

router.get("/api/analytics/prompts", async (req, res) => {
  const requestedLimit = Number(req.query.limit) || 20;
  const limit = Math.max(1, Math.min(requestedLimit, 100));

  res.json({
    prompts: await getStoredPrompts(limit)
  });
});

module.exports = router;
