"use strict";

// This file only turns the analysis JSON into visible HTML.
// Keeping rendering separate from API calls makes the code easier to reason about.
function renderResultInUI(jsonObject) {
  const report = document.getElementById("analysis-report");
  if (!report) {
    throw new Error("Analysis report container was not found on the page.");
  }

  // Start with a heading, then add one block of HTML for each analysis category.
  let htmlContent = `<h3>Analysis Result</h3>`;

  // These keys should match the JSON structure requested in your analysis prompt.
  const categories = ["gestalt_structure", "attention_preattentive", "cognitive_load", "reference_context"];

  categories.forEach(key => {
    const data = jsonObject[key];

    // If Gemini omitted one category, skip it instead of crashing.
    if (!data) return;

    // Convert an array like ["fix A", "fix B"] into <li>fix A</li><li>fix B</li>.
    const points = data.improvement_points.map(point => `<li>${point}</li>`).join("");
    const displayName = key.replace("_", " ").toUpperCase();

    htmlContent += `
      <div style="background: #fdfdfd; border: 1px solid #e0e0e0; padding: 15px; margin-bottom: 15px; border-radius: 8px; font-family: sans-serif;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>${displayName}</span>
          <span style="color: #007bff;">Score: ${data.score}/10</span>
        </div>
        <p style="margin: 8px 0;">${data.assessment}</p>
        <ul style="margin: 5px 0; padding-left: 20px; color: #555;">${points}</ul>
      </div>`;
  });

  // Add the final summary if Gemini included one.
  if (jsonObject.final_assessment) {
    htmlContent += `<div style="background: #e9ecef; padding: 15px; border-radius: 8px; font-family: sans-serif;"><strong>Final assessment:</strong><p>${jsonObject.final_assessment}</p></div>`;
  }

  // innerHTML tells the browser to interpret the string as HTML.
  report.innerHTML = htmlContent;
}
