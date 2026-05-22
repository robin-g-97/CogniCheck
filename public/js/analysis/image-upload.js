// This file handles image input on the analysis page:
// - drag and drop
// - reading the selected image file
// - storing the image as Base64 so it can be sent to the backend

const dropzone = document.getElementById("dropzone");

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

// When the user drops a file, reuse the same openFile(...) function that the file input uses.
dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("dragover");

  const file = event.dataTransfer.files[0];
  if (file) openFile({ target: { files: [file] } });
});

// This variable remembers the uploaded image between function calls.
// It starts as null because no image has been selected yet.
let currentBase64 = null;

// Called when you choose a file in an <input type="file"> element.
// The "fileEvent" argument is the browser event from onchange="openFile(event)".
let openFile = function(fileEvent) {
  const input = fileEvent.target;

  // FileReader is a browser API for reading local files selected by the user.
  const reader = new FileReader();

  // This function runs later, after the browser has finished reading the file.
  reader.onload = function() {
    // reader.result is a Data URL, for example:
    // data:image/png;base64,iVBORw0KGgo...
    currentBase64 = reader.result;

    // Show a preview in the <img id="output"> element.
    const output = document.getElementById("output");
    output.src = currentBase64;
  };

  // Start reading the first selected file as a Data URL.
  reader.readAsDataURL(input.files[0]);
};

// Lightweight check before the expensive full analysis.
// It asks Gemini whether the image looks like a report/dashboard.
async function checkIsReport(base64) {
  // Split the Data URL into the part Gemini needs:
  // - base64Data: the actual image data
  // - mimeType: image/png, image/jpeg, etc.
  const base64Data = base64.split(",")[1];
  const mimeType = base64.split(";")[0].split(":")[1];

  const data = await postJson("/analyze", {
    base64: base64Data,
    mimeType: mimeType,
    prompt: "Is this image a data report, dashboard, or business presentation? Answer only 'yes' or 'no'.",
    maxOutputTokens: 5
  });

  // Gemini responses are nested. Optional chaining (?.) safely checks each level.
  // If candidates is missing, this becomes undefined instead of crashing.
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!answer) {
    console.log("Unexpected Gemini response:", data);
    throw new Error("Gemini did not return an answer for the report check.");
  }

  return answer.toLowerCase().trim().includes("yes");
}
