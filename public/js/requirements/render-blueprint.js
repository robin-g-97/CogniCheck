// This file only displays the generated blueprint result.
function renderBlueprintOutput(text = "") {
  const response = text || "please upload a file first";

  // Find the output area in requirements-page.html.
  const container = document.getElementById("result-container");
  const blueprintOutput = document.getElementById("blueprintOutput");

  // Make the output area visible and insert the generated HTML.
  container.style.display = "block";
  blueprintOutput.innerHTML = response;
}
