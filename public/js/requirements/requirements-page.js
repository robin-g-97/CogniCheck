// Main page flow for the requirements-to-blueprint page.
let blueprintSelectedLanguage = window.CogniCheckI18n?.getLanguage() || "Dutch";
let latestBlueprintRequestId = "";

function handleRequirementsLanguageChange(event) {
  blueprintSelectedLanguage = event.target.value;
  window.CogniCheckI18n?.setLanguage(blueprintSelectedLanguage);
}

// This function is called by the "Generate Blueprint" button.
async function analyzeRequirements() {
  // requirements is filled by openRequirements(...) in file-reader.js.
  if (requirements === "") {
    alert("Please upload a file first.");
    return;
  }

  // Get references to HTML elements we want to update.
  const container = document.getElementById("result-container");
  const blueprintOutput = document.getElementById("blueprintOutput");

  // Show a loading state while the backend/Gemini request is running.
  container.style.display = "block";
  blueprintOutput.innerText = window.CogniCheckI18n?.t("requirements.generating", "Generating response...") || "Generating response...";
  document.getElementById("blueprint-feedback-container").innerHTML = "";

  // Send the extracted requirements text to the Express backend.
  // The backend adds the prompt and calls Gemini.
  const data = await postJson("/api/analyze-requirements", {
    text: requirements,
    selectedLanguage: blueprintSelectedLanguage
  });

  // Render the HTML returned by Gemini into the page.
  latestBlueprintRequestId = data.requestId || "";
  renderBlueprintOutput(data.message, {
    selectedLanguage: blueprintSelectedLanguage,
    analysisEventId: latestBlueprintRequestId
  });
}

window.addEventListener("DOMContentLoaded", () => {
  blueprintSelectedLanguage = window.CogniCheckI18n?.getLanguage() || blueprintSelectedLanguage;
  const selector = document.getElementById("requirementsLanguage");
  if (selector) selector.value = blueprintSelectedLanguage;
});

window.addEventListener("cognicheck:languagechange", event => {
  blueprintSelectedLanguage = event.detail.language;
});
