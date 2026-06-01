# CogniCheck Server

CogniCheck Server is a Node.js and Express application for running AI-assisted analysis workflows in the browser. It serves a small static frontend and provides API endpoints that call Google Gemini for screenshot analysis and requirements-to-blueprint generation.

## Features

- Password-protected demo access with an optional `APP_PASSWORD`
- Screenshot/image upload analysis via Gemini
- Requirements document analysis for generating blueprint-style output
- Static browser pages served from `public/`
- Shared Gemini service wrapper in `src/services/gemini.js`

## Project Structure

```text
.
+-- public/                 Static HTML, CSS, JavaScript, and images
|   +-- Analysis.html        Screenshot analysis page
|   +-- requirements-page.html
|   +-- css/
|   +-- js/
+-- src/
|   +-- prompts/            Prompt builders
|   +-- routes/             Express API routes
|   +-- services/           External service integrations
+-- docs/                   Project documentation
+-- server.js               Express server entrypoint
+-- package.json
+-- package-lock.json
```

## Requirements

- Node.js 18 or newer
- npm
- Google Gemini API key

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
APP_PASSWORD=optional_demo_password
REQUIREMENTS_BLUEPRINT_PROMPT=requirements_analysis_prompt_with_optional_{{requirements}}_placeholder
DATABASE_URL=${{Postgres.DATABASE_URL}}
PROMPT_LOGGING_ENABLED=true
PORT=3000
```

`GEMINI_API_KEY` and `REQUIREMENTS_BLUEPRINT_PROMPT` are required for AI analysis. `APP_PASSWORD` is optional; when it is not set, the app runs without login protection. The CogniCheck report analysis prompt lives server-side in `src/prompts/`, so it does not need to be configured in Railway. If `REQUIREMENTS_BLUEPRINT_PROMPT` includes `{{requirements}}`, the uploaded requirements text is inserted there. Otherwise, the text is appended to the prompt automatically.

`DATABASE_URL` enables PostgreSQL-backed analytics. In Railway, set it to `${{Postgres.DATABASE_URL}}` after adding a PostgreSQL service. `PROMPT_LOGGING_ENABLED=false` disables storing generated prompts.

## Running Locally

Start the server:

```bash
npm start
```

For development with automatic restarts:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Main Pages

- `/` - homepage
- `/Analysis.html` - screenshot analysis workflow
- `/requirements-page.html` - requirements-to-blueprint workflow
- `/analytics.html` - protected analytics dashboard for views, analysis counts, and prompt logs

## API Routes

- `POST /analyze` - analyzes an uploaded image with a prompt
- `POST /api/analyze-report` - imports report context or performs full CogniCheck analysis with server-side prompts
- `POST /api/analyze-requirements` - analyzes requirements text and returns generated blueprint content
- `GET /api/analytics/summary` - returns protected PostgreSQL-backed viewer and analysis counts
- `GET /api/analytics/prompts?limit=20` - returns protected generated prompt logs
- `POST /login` - starts a password-protected session when `APP_PASSWORD` is set
- `GET /logout` - clears the session
- `GET /session` - returns the current authentication state

## Notes

- `.env` and `node_modules/` are intentionally ignored by Git.
- The app uses CommonJS modules.
- The frontend currently relies on browser scripts in `public/js/`.
