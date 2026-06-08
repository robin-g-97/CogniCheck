const crypto = require("crypto");
const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;
const outputLoggingEnabled = process.env.OUTPUT_LOGGING_ENABLED !== "false";
const databaseConfigured = Boolean(databaseUrl) && !databaseUrl.includes("${{");

const pool = databaseConfigured
  ? new Pool({
      connectionString: databaseUrl,
      ...(process.env.DATABASE_SSL === "true" && {
        ssl: { rejectUnauthorized: false }
      })
    })
  : null;

let initialized = false;
let initializationPromise = null;

function hashValue(value = "") {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex")
    .slice(0, 32);
}

async function query(text, params = []) {
  if (!pool) {
    return { rows: [] };
  }

  await ensureAnalyticsTables();
  return pool.query(text, params);
}

async function ensureAnalyticsTables() {
  if (!pool || initialized) {
    return;
  }

  if (!initializationPromise) {
    initializationPromise = pool.query(`
      create table if not exists page_views (
        id bigserial primary key,
        created_at timestamptz not null default now(),
        path text not null,
        session_hash text,
        referrer text,
        user_agent text
      );

      create table if not exists analysis_events (
        id bigserial primary key,
        created_at timestamptz not null default now(),
        request_id text,
        user_email text,
        mode text not null,
        selected_language text,
        success boolean not null,
        error text
      );

      create table if not exists llm_inputs (
        id bigserial primary key,
        created_at timestamptz not null default now(),
        request_id text not null,
        user_email text,
        mode text not null,
        selected_language text,
        input text not null
      );

      create table if not exists llm_outputs (
        id bigserial primary key,
        created_at timestamptz not null default now(),
        request_id text,
        user_email text,
        mode text not null,
        selected_language text,
        output text not null
      );

      create table if not exists analysis_feedback (
        id bigserial primary key,
        created_at timestamptz not null default now(),
        analysis_event_id text,
        user_email text,
        workflow text,
        selected_language text,
        cognitive_load_score integer,
        decision_alignment_score integer,
        overall_score integer,
        usefulness_rating integer,
        cognitive_load_score_feedback text,
        decision_alignment_score_feedback text,
        overall_score_feedback text,
        main_issue_feedback text,
        main_issue_comment text,
        recommendation_actionability text,
        recommendation_comment text,
        context_match text,
        context_comment text,
        real_workflow_use text,
        workflow_comment text,
        free_text_feedback text
      );

      alter table analysis_events add column if not exists request_id text;
      alter table analysis_events add column if not exists user_email text;
      alter table llm_outputs add column if not exists request_id text;
      alter table llm_outputs add column if not exists user_email text;
      alter table analysis_feedback add column if not exists user_email text;
      alter table analysis_feedback add column if not exists workflow text;

      create index if not exists page_views_created_at_idx on page_views (created_at desc);
      create index if not exists analysis_events_created_at_idx on analysis_events (created_at desc);
      create index if not exists analysis_events_request_id_idx on analysis_events (request_id);
      create index if not exists analysis_events_user_email_idx on analysis_events (user_email);
      create index if not exists llm_inputs_created_at_idx on llm_inputs (created_at desc);
      create index if not exists llm_inputs_request_id_idx on llm_inputs (request_id);
      create index if not exists llm_inputs_user_email_idx on llm_inputs (user_email);
      create index if not exists llm_outputs_created_at_idx on llm_outputs (created_at desc);
      create index if not exists llm_outputs_request_id_idx on llm_outputs (request_id);
      create index if not exists llm_outputs_user_email_idx on llm_outputs (user_email);
      create index if not exists analysis_feedback_created_at_idx on analysis_feedback (created_at desc);
      create index if not exists analysis_feedback_event_idx on analysis_feedback (analysis_event_id);
    `)
      .then(() => {
        initialized = true;
      })
      .catch(error => {
        initializationPromise = null;
        throw error;
      });
  }

  return initializationPromise;
}

async function safeQuery(text, params = []) {
  try {
    return await query(text, params);
  } catch (error) {
    console.warn("Analytics database write/read failed:", error.message);
    return { rows: [] };
  }
}

async function trackPageView(req) {
  if (!pool) return;

  const sessionSource = req.headers.cookie || `${req.ip || ""}:${req.headers["user-agent"] || ""}`;

  await query(
    `insert into page_views (path, session_hash, referrer, user_agent)
     values ($1, $2, $3, $4)`,
    [
      req.path,
      hashValue(sessionSource),
      req.get("referer") || "",
      (req.get("user-agent") || "").slice(0, 240)
    ]
  );
}

async function trackAnalysisEvent({ requestId, userEmail, mode, selectedLanguage, success, error }) {
  if (!pool) return;

  await safeQuery(
    `insert into analysis_events (request_id, user_email, mode, selected_language, success, error)
     values ($1, $2, $3, $4, $5, $6)`,
    [requestId || "", userEmail || "", mode, selectedLanguage || "", success, error || ""]
  );
}

async function trackLlmInput({ requestId, userEmail, mode, selectedLanguage, input }) {
  if (!pool || !outputLoggingEnabled || !input) return;

  await safeQuery(
    `insert into llm_inputs (request_id, user_email, mode, selected_language, input)
     values ($1, $2, $3, $4, $5)`,
    [requestId || "", userEmail || "", mode, selectedLanguage || "", input]
  );
}

async function trackLlmOutput({ requestId, userEmail, mode, selectedLanguage, output }) {
  if (!pool || !outputLoggingEnabled || !output) return;

  await safeQuery(
    `insert into llm_outputs (request_id, user_email, mode, selected_language, output)
     values ($1, $2, $3, $4, $5)`,
    [requestId || "", userEmail || "", mode, selectedLanguage || "", output]
  );
}

async function storeAnalysisFeedback(feedback = {}) {
  if (!pool) {
    console.warn("Feedback storage unavailable: DATABASE_URL is not configured.");
    return { stored: false };
  }

  await safeQuery(
    `insert into analysis_feedback (
      analysis_event_id,
      user_email,
      workflow,
      selected_language,
      cognitive_load_score,
      decision_alignment_score,
      overall_score,
      usefulness_rating,
      cognitive_load_score_feedback,
      decision_alignment_score_feedback,
      overall_score_feedback,
      main_issue_feedback,
      main_issue_comment,
      recommendation_actionability,
      recommendation_comment,
      context_match,
      context_comment,
      real_workflow_use,
      workflow_comment,
      free_text_feedback
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
    )`,
    [
      feedback.analysisEventId || null,
      feedback.userEmail || "",
      feedback.workflow || "",
      feedback.selectedLanguage || "",
      toNullableInteger(feedback.cognitiveLoadScore),
      toNullableInteger(feedback.decisionAlignmentScore),
      toNullableInteger(feedback.overallScore),
      toNullableInteger(feedback.usefulnessRating),
      feedback.cognitiveLoadScoreFeedback || "",
      feedback.decisionAlignmentScoreFeedback || "",
      feedback.overallScoreFeedback || "",
      feedback.mainIssueFeedback || "",
      feedback.mainIssueComment || "",
      feedback.recommendationActionability || "",
      feedback.recommendationComment || "",
      feedback.contextMatch || "",
      feedback.contextComment || "",
      feedback.realWorkflowUse || "",
      feedback.workflowComment || "",
      feedback.freeTextFeedback || ""
    ]
  );

  return { stored: true };
}

async function getAnalyticsSummary() {
  if (!pool) {
    return {
      configured: false,
      pageViews: { total: 0, byPath: {}, uniqueViewerEstimate: 0 },
      analyses: { totalEvents: 0, successful: 0, failed: 0, byMode: {}, byLanguage: {}, byEmail: {} },
      inputs: { stored: 0 },
      outputs: { stored: 0, latest: [] }
    };
  }

  const [
    pageViewTotal,
    pageViewsByPath,
    uniqueViewers,
    analysisTotals,
    analysisByMode,
    analysisByLanguage,
    analysisByEmail,
    inputTotal,
    outputTotal,
    latestOutputs
  ] = await Promise.all([
    safeQuery("select count(*)::int as count from page_views"),
    safeQuery("select path, count(*)::int as count from page_views group by path order by count desc"),
    safeQuery("select count(distinct session_hash)::int as count from page_views"),
    safeQuery(`
      select
        count(*)::int as total_events,
        count(*) filter (where success)::int as successful,
        count(*) filter (where not success)::int as failed
      from analysis_events
    `),
    safeQuery("select mode, count(*)::int as count from analysis_events group by mode order by count desc"),
    safeQuery("select selected_language, count(*)::int as count from analysis_events group by selected_language order by count desc"),
    safeQuery("select user_email, count(*)::int as count from analysis_events group by user_email order by count desc"),
    safeQuery("select count(*)::int as count from llm_inputs"),
    safeQuery("select count(*)::int as count from llm_outputs"),
    safeQuery("select id, request_id, user_email, created_at, mode, selected_language from llm_outputs order by created_at desc limit 10")
  ]);

  const totals = analysisTotals.rows[0] || {};

  return {
    configured: true,
    pageViews: {
      total: pageViewTotal.rows[0]?.count || 0,
      byPath: rowsToCountMap(pageViewsByPath.rows, "path"),
      uniqueViewerEstimate: uniqueViewers.rows[0]?.count || 0
    },
    analyses: {
      totalEvents: totals.total_events || 0,
      successful: totals.successful || 0,
      failed: totals.failed || 0,
      byMode: rowsToCountMap(analysisByMode.rows, "mode"),
      byLanguage: rowsToCountMap(analysisByLanguage.rows, "selected_language"),
      byEmail: rowsToCountMap(analysisByEmail.rows, "user_email")
    },
    inputs: {
      stored: inputTotal.rows[0]?.count || 0
    },
    outputs: {
      stored: outputTotal.rows[0]?.count || 0,
      latest: latestOutputs.rows.map(row => ({
        id: row.id,
        requestId: row.request_id,
        userEmail: row.user_email,
        timestamp: row.created_at,
        mode: row.mode,
        selectedLanguage: row.selected_language
      }))
    }
  };
}

async function getStoredOutputs(limit = 20) {
  if (!pool) {
    return [];
  }

  const result = await safeQuery(
    `select id, request_id, user_email, created_at, mode, selected_language, output
     from llm_outputs
     order by created_at desc
     limit $1`,
    [limit]
  );

  return result.rows.map(row => ({
    id: row.id,
    requestId: row.request_id,
    userEmail: row.user_email,
    timestamp: row.created_at,
    mode: row.mode,
    selectedLanguage: row.selected_language,
    output: row.output
  }));
}

async function getStoredInputs(limit = 20) {
  if (!pool) {
    return [];
  }

  const result = await safeQuery(
    `select id, request_id, user_email, created_at, mode, selected_language, input
     from llm_inputs
     order by created_at desc
     limit $1`,
    [limit]
  );

  return result.rows.map(row => ({
    id: row.id,
    requestId: row.request_id,
    userEmail: row.user_email,
    timestamp: row.created_at,
    mode: row.mode,
    selectedLanguage: row.selected_language,
    input: row.input
  }));
}

function rowsToCountMap(rows, key) {
  return rows.reduce((counts, row) => {
    counts[row[key] || "unknown"] = row.count;
    return counts;
  }, {});
}

function toNullableInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

module.exports = {
  getAnalyticsSummary,
  getStoredInputs,
  getStoredOutputs,
  storeAnalysisFeedback,
  trackAnalysisEvent,
  trackLlmInput,
  trackLlmOutput,
  trackPageView,
};
