# CogniCheck Project Structure Guide

This guide describes a clean structure for the current CogniCheck app: an Express server with static HTML, CSS, and browser JavaScript.

The goal is to keep the project simple while separating responsibilities:

- `server.js` starts the app and wires things together.
- `src/` contains backend code.
- `public/` contains files the browser can access.
- prompts, routes, Gemini calls, page scripts, and shared UI helpers each have their own place.

## Recommended Structure

```txt
cognicheck-server/
  server.js
  package.json
  package-lock.json
  .env
  .gitignore

  docs/
    project-structure-guide.md

  src/
    routes/
      analyze-image.js
      analyze-requirements.js
      config.js

    services/
      gemini.js

    prompts/
      report-analysis.js
      requirements-blueprint.js

  public/
    index.html
    Analysis.html
    requirements-blueprint.html

    css/
      style.css

    js/
      shared/
        nav.js
        api.js

      analysis/
        analyze-page.js
        image-upload.js
        render-analysis.js

      requirements/
        requirements-page.js
        file-reader.js
        render-blueprint.js
```

## What Goes Where

### Root Files

Keep root files limited to project-level configuration.

```txt
server.js
package.json
package-lock.json
.env
.gitignore
```

Use the root for files that explain, install, or start the project.

Do not put route logic, prompts, or frontend page behavior directly in the root once the project grows.

### `server.js`

`server.js` should be the entry point only.

It should:

- load `.env`
- create the Express app
- add middleware like `express.json()`
- serve the `public/` folder
- mount API routes
- start the server

Example:

```js
require("dotenv").config();

const express = require("express");
const path = require("path");

const analyzeImageRoutes = require("./src/routes/analyze-image");
const analyzeRequirementsRoutes = require("./src/routes/analyze-requirements");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", analyzeImageRoutes);
app.use("/api", analyzeRequirementsRoutes);

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```

Avoid putting large prompts or Gemini request code directly in `server.js`.

### `src/routes/`

Routes receive browser requests and return responses.

Good route responsibilities:

- read `req.body`
- validate required fields
- call a service function
- return JSON to the frontend
- handle errors

Example files:

```txt
src/routes/analyze-image.js
src/routes/analyze-requirements.js
```

Example route shape:

```js
const express = require("express");
const { generateGeminiContent } = require("../services/gemini");
const { requirementsBlueprintPrompt } = require("../prompts/requirements-blueprint");

const router = express.Router();

router.post("/analyze-requirements", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing requirements text." });
    }

    const message = await generateGeminiContent({
      prompt: requirementsBlueprintPrompt(text)
    });

    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### `src/services/`

Services contain reusable backend logic.

For this app, the main service is Gemini communication:

```txt
src/services/gemini.js
```

This file should know:

- which Gemini model to call
- how to build the Gemini API request
- where to read `process.env.GEMINI_API_KEY`
- how to extract text from the Gemini response

Routes should not repeat Gemini `fetch(...)` logic.

### `src/prompts/`

Prompts belong in separate files.

Example:

```txt
src/prompts/report-analysis.js
src/prompts/requirements-blueprint.js
```

Use functions when the prompt needs user input:

```js
function requirementsBlueprintPrompt(text) {
  return `You are a Senior Power BI Architect.

Analyze the following requirements document and provide structured feedback.

Here are the requirements:
${text}`;
}

module.exports = { requirementsBlueprintPrompt };
```

This keeps prompts easy to edit without digging through route code.

### `public/`

Everything in `public/` is visible to the browser.

Put only frontend files here:

- HTML pages
- CSS
- browser JavaScript
- images or other static assets

Never put secrets in `public/`.

This means no API keys, no private `.env` values, and no server-only logic.

### `public/css/`

Put stylesheets here:

```txt
public/css/style.css
```

Then update HTML links:

```html
<link rel="stylesheet" href="/css/style.css">
```

### `public/js/shared/`

Use this folder for browser code used by multiple pages.

Good examples:

```txt
public/js/shared/nav.js
public/js/shared/api.js
```

`nav.js` should only render navigation.

`api.js` can contain helper functions like:

```js
async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return response.json();
}
```

Avoid putting page-specific code in shared files.

For example, `components.js` currently handles navigation and also assumes a `dropzone` exists. That should be split, because not every page has a dropzone.

### `public/js/analysis/`

Use this folder for the dashboard image analysis page.

Suggested files:

```txt
public/js/analysis/analyze-page.js
public/js/analysis/image-upload.js
public/js/analysis/render-analysis.js
```

Responsibilities:

- `analyze-page.js`: connects buttons, state, and page flow
- `image-upload.js`: handles file input, drag and drop, base64 conversion
- `render-analysis.js`: renders the Gemini result into HTML

### `public/js/requirements/`

Use this folder for the requirements-to-blueprint page.

Suggested files:

```txt
public/js/requirements/requirements-page.js
public/js/requirements/file-reader.js
public/js/requirements/render-blueprint.js
```

Responsibilities:

- `requirements-page.js`: connects the upload and generate button
- `file-reader.js`: reads `.txt` and `.docx` files
- `render-blueprint.js`: displays the generated blueprint result

## HTML Rules

### Keep `<head>` for Metadata Only

Do not put visible elements like this inside `<head>`:

```html
<div id="nav"></div>
```

Put it inside `<body>`:

```html
<body>
  <div id="nav"></div>
  ...
</body>
```

### Prefer External JavaScript

Avoid inline handlers like:

```html
<button onclick="analyzeRequirements()">Generate Blueprint</button>
```

Prefer giving the button an id:

```html
<button id="generateButton" class="button">Generate Blueprint</button>
```

Then attach the listener in JavaScript:

```js
document.getElementById("generateButton").addEventListener("click", analyzeRequirements);
```

This makes HTML cleaner and keeps behavior in JavaScript files.

### Use Lowercase File Names

Prefer:

```txt
Analysis.html
requirements-blueprint.html
```

Over:

```txt
Analysis.html
Req2blueprint.html
```

This keeps URLs consistent and avoids case-sensitivity problems later if the app is deployed to Linux.

## API Naming

Use `/api/...` for backend routes called by the frontend.

Recommended endpoints:

```txt
POST /api/analyze-report
POST /api/analyze-requirements
GET  /api/analysis-prompt
```

The current `/analyze` endpoint works, but `/api/analyze-report` is clearer and grouped with other API routes.

Use one language for route names. Since the UI and prompts are mostly English right now, English API names are a good default.

## Environment Variables

Use `.env` for values that should not be hardcoded.

Examples:

```txt
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite
PORT=3000
ANALYSIS_PROMPT=...
```

Important rule:

- Backend can read `process.env`.
- Frontend cannot read `process.env` directly.
- Anything sent from the backend to the frontend becomes visible in the browser.

Keep `GEMINI_API_KEY` server-side only.

## Suggested Migration Plan

Do this in small steps. Each step should leave the app working.

### Step 1: Create Folders

Create:

```txt
src/routes/
src/services/
src/prompts/
public/css/
public/js/shared/
public/js/analysis/
public/js/requirements/
```

Do not move code yet. Just create the structure.

### Step 2: Move CSS

Move:

```txt
public/style.css
```

To:

```txt
public/css/style.css
```

Update HTML:

```html
<link rel="stylesheet" href="/css/style.css">
```

Test all pages.

### Step 3: Split Shared Frontend Code

Replace `components.js` with:

```txt
public/js/shared/nav.js
public/js/analysis/image-upload.js
```

Only include `image-upload.js` on pages that use the dropzone.

### Step 4: Move Page Scripts

Move:

```txt
public/Cognicheck.js
```

To:

```txt
public/js/analysis/analyze-page.js
```

Move:

```txt
public/Phase1analysis.js
```

To:

```txt
public/js/requirements/requirements-page.js
```

Update script tags in the HTML files.

### Step 5: Move Prompts

Create:

```txt
src/prompts/report-analysis.js
src/prompts/requirements-blueprint.js
```

Move long prompt text out of `server.js` into these files.

### Step 6: Create Gemini Service

Create:

```txt
src/services/gemini.js
```

Move Gemini `fetch(...)` logic into reusable functions.

The route files should call the service instead of building raw Gemini requests themselves.

### Step 7: Split Routes

Create:

```txt
src/routes/analyze-image.js
src/routes/analyze-requirements.js
```

Move each route from `server.js` into the matching file.

Then mount them from `server.js`:

```js
app.use("/api", analyzeImageRoutes);
app.use("/api", analyzeRequirementsRoutes);
```

### Step 8: Clean Up Names

After everything works, rename pages:

```txt
Analysis.html
Req2blueprint.html -> requirements-blueprint.html
```

Update navigation links in `nav.js`.

## Practical Rules of Thumb

- If it calls Gemini, it belongs in `src/`.
- If it reads `.env`, it belongs in `src/` or `server.js`.
- If the browser loads it directly, it belongs in `public/`.
- If it is reused by routes, put it in `src/services/`.
- If it is reused by frontend pages, put it in `public/js/shared/`.
- If it is only for one page, put it in that page's frontend folder.
- If it is a long AI instruction, put it in `src/prompts/`.
- Keep `server.js` boring. Boring server entry files are good server entry files.

## Current File Mapping

Current files and where they should eventually go:

```txt
server.js
  keep as the app entry point, but move route logic out over time

public/style.css
  public/css/style.css

public/components.js
  public/js/shared/nav.js
  public/js/analysis/image-upload.js

public/Cognicheck.js
  public/js/analysis/analyze-page.js
  public/js/analysis/render-analysis.js

public/Phase1analysis.js
  public/js/requirements/requirements-page.js
  public/js/requirements/file-reader.js
  public/js/requirements/render-blueprint.js

public/Analysis.html
  public/Analysis.html

public/Req2blueprint.html
  public/requirements-blueprint.html
```

## When to Consider React Later

Stay with the current static HTML approach for now.

Consider React only when the frontend becomes hard to manage because:

- many parts of the page update based on state
- components are repeated across pages
- conditional UI states become messy
- manual DOM updates become difficult to follow

The next best improvement is structure, not a new framework.

