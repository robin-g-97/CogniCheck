// This file handles the report screenshot input:
// - drag and drop
// - reading the selected image file
// - storing the image as Base64 so it can be sent to the backend

const dropzone = document.getElementById("dropzone");

// These globals are intentionally simple because the demo page is plain HTML + JS.
let uploadedImage = null;
let currentBase64 = null;

if (dropzone) {
  // Dragging a file over the dropzone does not work by default in the browser.
  // preventDefault() tells the browser: "we are handling this drop ourselves."
  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });

  // Remove the visual highlight when the user drags the file away.
  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  // When the user drops a file, reuse the same upload handler that the file input uses.
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragover");

    const file = event.dataTransfer.files[0];
    if (file) handleImageUpload({ target: { files: [file] } });
  });
}

// Reads the uploaded report screenshot and stores both preview and API-ready data.
function handleImageUpload(fileEvent) {
  const file = fileEvent.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function() {
    currentBase64 = reader.result;
    uploadedImage = {
      fileName: file.name,
      mimeType: file.type || "image/png",
      dataUrl: reader.result,
      base64: reader.result.split(",")[1]
    };

    const output = document.getElementById("output");
    output.src = uploadedImage.dataUrl;
    output.alt = `Uploaded report screenshot: ${file.name}`;
  };

  reader.readAsDataURL(file);
}

// Backwards-compatible name for older inline handlers or bookmarks.
let openFile = handleImageUpload;

// Lightweight check before the expensive full analysis.
// It asks Gemini whether the image looks like a report/dashboard.
// TODO: To reduce cost and latency, fold this report-like check into the import step later.
async function checkIsReport(base64) {
  const base64Data = base64.split(",")[1];
  const mimeType = base64.split(";")[0].split(":")[1];

  const data = await postJson("/analyze", {
    base64: base64Data,
    mimeType: mimeType,
    prompt: "Is this image a data report, dashboard, or business presentation? Answer only 'yes' or 'no'.",
    maxOutputTokens: 5
  });

  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!answer) {
    console.log("Unexpected Gemini response:", data);
    throw new Error("Gemini did not return an answer for the report check.");
  }

  return answer.toLowerCase().trim().includes("yes");
}
