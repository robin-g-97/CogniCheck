# CogniCheck Server

CogniCheck Server is a Node.js and Express application for running AI-assisted analysis workflows in the browser. It serves a small static frontend and provides API endpoints that call Google Gemini for screenshot analysis and requirements-to-blueprint generation.

## Features

- Email-based demo access with an `ALLOWED_EMAILS` allowlist and magic links
- Screenshot/image upload analysis via Gemini
- Requirements document analysis for generating blueprint-style output
- Two-step CogniCheck report analysis: import structured context, then run the final analysis
- Server-side CogniCheck methodology and scoring rubrics loaded from `backend/knowledge/`
- Concise JSON final analysis output for cognitive load, decision alignment, psychological lens, recommendations, and missing context
- Static browser pages served from `public/`
- Shared Gemini service wrapper in `src/services/gemini.js`

## Project Structure

```text
.
+-- backend/
|   +-- knowledge/         CogniCheck methodology, rubrics, and final output format
+-- public/                 Static HTML, CSS, JavaScript, and images
|   +-- Analysis.html        Screenshot analysis page
|   +-- demo.html            Protected demo landing page
|   +-- methodology.html     Public methodology overview
|   +-- workshop.html        Public workshop offer page
|   +-- privacy.html         Public data handling page
|   +-- robots.txt           Search engine crawl rules
|   +-- sitemap.xml          Public page sitemap
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
APP_PASSWORD=optional_legacy_demo_password
ALLOWED_EMAILS=robin@cognicheck.tech,estienstra@ilionx.com
APP_BASE_URL=https://www.cognicheck.tech
MAGIC_LINK_SECRET=long_random_secret_for_login_links
REQUIREMENTS_BLUEPRINT_PROMPT=requirements_analysis_prompt_with_optional_{{requirements}}_placeholder
DATABASE_URL=${{Postgres.DATABASE_URL}}
OUTPUT_LOGGING_ENABLED=true
RESEND_API_KEY=your_resend_api_key
CONTACT_TO_EMAIL=robin@cognicheck.tech
CONTACT_FROM_EMAIL=onboarding@resend.dev
PORT=3000
```

`GEMINI_API_KEY` and `REQUIREMENTS_BLUEPRINT_PROMPT` are required for AI analysis. `ALLOWED_EMAILS` controls who can request a CogniCheck access link. Add exact email addresses separated by commas, or add a domain such as `@cognicheck.tech` or `cognicheck.tech` to allow every address on that domain. The app includes `robin@cognicheck.tech` and `estienstra@ilionx.com` as local defaults when `ALLOWED_EMAILS` is not configured. `APP_PASSWORD` is only kept as an optional legacy fallback. The CogniCheck report analysis prompt lives server-side in `src/prompts/`, so it does not need to be configured in Railway. The prompt builder also loads Markdown files from `backend/knowledge/` and injects them into the final CogniCheck prompt on the server only. If `REQUIREMENTS_BLUEPRINT_PROMPT` includes `{{requirements}}`, the uploaded requirements text is inserted there. Otherwise, the text is appended to the prompt automatically.

`RESEND_API_KEY` is required for email login links. `APP_BASE_URL` should be set in Railway so access links use the public site URL. `MAGIC_LINK_SECRET` is recommended for stable, private signing of login links; when it is not set, the server falls back to `APP_PASSWORD`, then `RESEND_API_KEY`.

`DATABASE_URL` enables PostgreSQL-backed analytics. In Railway, set it to `${{Postgres.DATABASE_URL}}` after adding a PostgreSQL service. `OUTPUT_LOGGING_ENABLED=false` disables storing generated LLM inputs and outputs. When logging is enabled, LLM inputs and outputs are linked by `request_id` and include the authenticated login email address when available.

`RESEND_API_KEY` enables the homepage contact form and access links to send email directly from the backend. Replace `your_resend_api_key` with your real Resend API key. By default, messages are sent to `robin@cognicheck.tech` from Resend's test sender, `onboarding@resend.dev`. For the most professional setup, verify `cognicheck.tech` in Resend and then set `CONTACT_FROM_EMAIL` to an address on that domain, such as `CogniCheck <contact@cognicheck.tech>`.

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
- `/methodology.html` - public CogniCheck methodology overview
- `/methodology-requirements.html` - public Requirements to Blueprint methodology
- `/methodology-analysis.html` - public Report Analysis methodology
- `/workshop.html` - public workshop + tool access offer
- `/privacy.html` - public privacy and data handling page
- `/demo.html` - protected demo landing page after login
- `/Analysis.html` - protected screenshot analysis workflow
- `/requirements-page.html` - protected requirements-to-blueprint workflow
- `/analytics.html` - protected analytics dashboard for views, analysis counts, and linked LLM input/output logs

When access protection is enabled, successful email login redirects to `/demo.html`. Public visitors can read the methodology, workshop and privacy pages without logging in, while `/demo.html`, `/Analysis.html`, `/requirements-page.html`, and `/analytics.html` remain protected.

The public website is positioned around a paid workshop plus temporary tool access journey: visitors can read the methodology, review the workshop offer, book an intake, and then use the protected demo tools during a pilot or workshop.

## SEO

Public pages include page-specific titles, descriptions, canonical URLs and Open Graph metadata. Protected demo/tool pages use `noindex,nofollow`. `robots.txt` allows public pages and excludes protected pages, while `sitemap.xml` lists the public pages intended for indexing.

## CogniCheck Analysis Flow

The report-analysis page uses two Gemini steps:

1. Import structured context from the uploaded screenshot, optional background text, and optional supporting files.
2. Perform the final CogniCheck analysis using the reviewed structured context and the server-side knowledge base.

The final analysis is intentionally short. It returns one JSON object with:

- executive verdict with total score and maturity level
- cognitive load score
- decision alignment score
- psychological lens
- top recommendations
- missing context

The older `public/js/analysis/render-analysis.js` renderer was removed because it supported a previous long JSON format. The current analysis page renders the concise JSON structure in `public/js/analysis/analyze-page.js`.

TXT supporting files are read in the browser. PDF and DOCX files are sent to Gemini as experimental attachments. XLSX is not supported yet.

AI responses can occasionally contain invalid JSON, especially malformed escaped characters. The frontend now handles these parsing errors gracefully by showing a retry message and logging only a short raw-response preview in the browser console for debugging.

## API Routes

- `POST /analyze` - analyzes an uploaded image with a prompt
- `POST /api/analyze-report` - imports report context or performs full CogniCheck analysis with server-side prompts
- `POST /api/analyze-requirements` - analyzes requirements text and returns generated blueprint content
- `GET /api/analytics/summary` - returns protected PostgreSQL-backed viewer and analysis counts
- `GET /api/analytics/inputs?limit=20` - returns protected generated LLM input logs
- `GET /api/analytics/outputs?limit=20` - returns protected generated LLM output logs
- `POST /api/contact` - sends homepage contact form submissions to the configured contact email
- `POST /login` - sends a magic login link to an allowed email address
- `GET /login?token=...` - starts a protected session from a valid magic link
- `GET /logout` - clears the session
- `GET /session` - returns the current authentication state

## Notes

- `.env` and `node_modules/` are intentionally ignored by Git.
- The app uses CommonJS modules.
- The frontend currently relies on browser scripts in `public/js/`.
- CogniCheck methodology files stay in `backend/knowledge/` and are not sent to the frontend directly.
