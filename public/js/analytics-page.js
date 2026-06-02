async function loadAnalytics() {
  const [summaryResponse, outputsResponse] = await Promise.all([
    fetch("/api/analytics/summary"),
    fetch("/api/analytics/outputs?limit=10")
  ]);

  if (!summaryResponse.ok || !outputsResponse.ok) {
    throw new Error("Could not load analytics data.");
  }

  const summary = await summaryResponse.json();
  const { outputs } = await outputsResponse.json();

  renderSummary(summary);
  renderBreakdown(summary);
  renderOutputLogs(outputs);
}

function renderSummary(summary) {
  document.getElementById("database-status").innerText = summary.configured
    ? ""
    : "Database is not configured. Add DATABASE_URL to enable persistent analytics.";

  document.getElementById("page-view-total").innerText = summary.pageViews.total;
  document.getElementById("unique-viewer-total").innerText = summary.pageViews.uniqueViewerEstimate;
  document.getElementById("analysis-success-total").innerText = summary.analyses.successful;
  document.getElementById("output-total").innerText = summary.outputs.stored;
}

function renderBreakdown(summary) {
  const breakdown = document.getElementById("analytics-breakdown");

  breakdown.innerHTML = `
    ${renderKeyValueList("Views by page", summary.pageViews.byPath)}
    ${renderKeyValueList("Analysis events by mode", summary.analyses.byMode)}
    ${renderKeyValueList("Analysis events by language", summary.analyses.byLanguage)}
  `;
}

function renderOutputLogs(outputs) {
  const container = document.getElementById("output-log-list");

  if (!outputs.length) {
    container.innerHTML = "<p>No LLM outputs have been stored yet.</p>";
    return;
  }

  container.innerHTML = outputs.map(outputEntry => `
    <details class="prompt-log-item">
      <summary>${escapeHtml(outputEntry.timestamp)} - ${escapeHtml(outputEntry.mode)} - ${escapeHtml(outputEntry.selectedLanguage || "unknown")}</summary>
      <pre>${escapeHtml(outputEntry.output)}</pre>
    </details>
  `).join("");
}

function renderKeyValueList(title, values) {
  const entries = Object.entries(values || {});

  if (!entries.length) {
    return `
      <div class="analytics-list">
        <h3>${escapeHtml(title)}</h3>
        <p>No data yet.</p>
      </div>
    `;
  }

  return `
    <div class="analytics-list">
      <h3>${escapeHtml(title)}</h3>
      <ul>
        ${entries.map(([key, value]) => `<li><span>${escapeHtml(key)}</span><strong>${value}</strong></li>`).join("")}
      </ul>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

loadAnalytics().catch(error => {
  document.getElementById("analytics-breakdown").innerHTML = `<p>${escapeHtml(error.message)}</p>`;
});
