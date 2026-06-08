// This file handles reading a requirements document from the user's computer.
// The extracted text is stored in the global requirements variable so
// requirements-page.js can send it to the backend later.
let requirements = "";

async function openRequirements(event) {
  let text = "";

  // event.target is the <input type="file"> element.
  // files[0] is the first selected file.
  const file = event.target.files[0];
  if (!file) return;

  if (file.name.endsWith(".txt")) {
    // Plain text files can be read directly by the browser.
    text = await file.text();
  } else if (file.name.endsWith(".docx")) {
    // Word files need the Mammoth browser library loaded in requirements-page.html.
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    text = result.value;
  } else {
    alert(window.CogniCheckI18n?.t("requirements.invalidFile", "Please upload a .txt or .docx file.") || "Please upload a .txt or .docx file.");
    return;
  }

  // Save the extracted text for analyzeRequirements().
  requirements = text;
}
