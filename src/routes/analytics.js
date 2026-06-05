const express = require("express");
const {
  getAnalyticsSummary,
  getStoredInputs,
  getStoredOutputs
} = require("../services/analytics-db");

const router = express.Router();

router.get("/api/analytics/summary", async (req, res) => {
  res.json(await getAnalyticsSummary());
});

router.get("/api/analytics/outputs", async (req, res) => {
  const requestedLimit = Number(req.query.limit) || 20;
  const limit = Math.max(1, Math.min(requestedLimit, 100));

  res.json({
    outputs: await getStoredOutputs(limit)
  });
});

router.get("/api/analytics/inputs", async (req, res) => {
  const requestedLimit = Number(req.query.limit) || 20;
  const limit = Math.max(1, Math.min(requestedLimit, 100));

  res.json({
    inputs: await getStoredInputs(limit)
  });
});

module.exports = router;
