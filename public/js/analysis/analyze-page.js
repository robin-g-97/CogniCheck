// Main page flow for the image analysis page.
// This function is called by the "Perform CogniCheck Analysis" button in Analysis.html.

let analyzeImage = async function() {
  try {
    // Guard clause: stop early if the user has not uploaded an image yet.
    if (!currentBase64) {
      alert("Please load an image first.");
      return;
    }

    // First ask the backend/Gemini whether this image is actually a report/dashboard.
    const isReport = await checkIsReport(currentBase64);
    if (!isReport) {
      alert("This does not appear to be a report. Upload a dashboard or report.");
      return;
    }

    // Get references to HTML elements we want to update.
    const jsonOutputElement = document.getElementById("json-output");
    const container = document.getElementById("result-container");

    // Show a loading state while the request is running.
    container.style.display = "block";
    jsonOutputElement.innerText = "Analyzing report, please wait...";
    document.getElementById("analyze-button").style.display = "none";

    // The uploaded image is stored as a Data URL.
    // Gemini needs the raw Base64 part and the MIME type separately.
    const base64Data = currentBase64.split(",")[1];
    const mimeType = currentBase64.split(";")[0].split(":")[1];

    // Get the large analysis prompt from the server.
    // This is a GET request, so it does not use postJson().
    const promptResponse = await fetch("/analysisprompt");
    const { prompt } = await promptResponse.json();

    // Full analysis: send the prompt + image to our Express backend.
    // The backend then calls Gemini. The API key never goes to the browser.
    const data = await postJson("/analyze", {
      base64: base64Data,
      mimeType: mimeType,
      prompt: prompt
    });

    const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawOutput) {
      console.log("Unexpected Gemini response:", data);
      throw new Error("Gemini did not return analysis text.");
    }

    // Gemini sometimes wraps JSON in Markdown code fences.
    // Remove those fences before JSON.parse().
    const cleanJsonString = rawOutput.replace(/```json|```/g, "").trim();
    const jsonObject = JSON.parse(cleanJsonString);

    // Show the raw JSON for debugging/learning.
    jsonOutputElement.innerText = JSON.stringify(jsonObject, null, 2);

    // Also render the same data as a nicer HTML result.
    renderResultInUI(jsonObject);
  } catch (error) {
    // If anything fails, show the real error instead of letting the browser crash.
    console.error("Analysis failed:", error);

    const container = document.getElementById("result-container");
    const jsonOutputElement = document.getElementById("json-output");

    if (container && jsonOutputElement) {
      container.style.display = "block";
      jsonOutputElement.innerText = `Analysis failed: ${error.message}`;
    } else {
      alert(`Analysis failed: ${error.message}`);
    }
  }
};

function printAnalysisReport() {
  const report = document.getElementById("analysis-report");
  if (!report || !report.innerText.trim()) {
    alert("There is no analysis report to print yet.");
    return;
  }

  window.print();
}
