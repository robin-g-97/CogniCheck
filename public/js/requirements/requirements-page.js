// Main page flow for the requirements-to-blueprint page.
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
  blueprintOutput.innerText = "Generating response...";

  // Send the extracted requirements text to the Express backend.
  // The backend adds the prompt and calls Gemini.
  const data = await postJson("/api/analyze-requirements", {
    text: requirements
  });

  // Render the HTML returned by Gemini into the page.
  renderBlueprintOutput(data.message);
}
