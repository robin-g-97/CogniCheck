// Small helper for POST requests that send and receive JSON.
// In Python terms, this is like wrapping requests.post(...).json()
// so every page does not have to repeat the same fetch setup.
async function postJson(url, body) {
  // fetch() is the browser's built-in way to make HTTP requests.
  // await pauses this async function until the server responds.
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },

    // HTTP request bodies are text, so we convert the JavaScript object to JSON text.
    body: JSON.stringify(body)
  });

  // Convert the JSON response body back into a JavaScript object.
  const data = await response.json();

  // If the server returned an error status, throw an Error with the server message.
  // This lets the page show a useful message instead of crashing later.
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}
