require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");

const analyticsRoutes = require("./src/routes/analytics");
const analysisFeedbackRoutes = require("./src/routes/analysis-feedback");
const analyzeImageRoutes = require("./src/routes/analyze-image");
const analyzeRequirementsRoutes = require("./src/routes/analyze-requirements");
const contactRoutes = require("./src/routes/contact");
const { trackPageView } = require("./src/services/analytics-db");

const app = express();
const port = process.env.PORT || 3000;
const sessionCookieName = "cognicheck_demo_session";
const sessionCookieValue = "authenticated";
const defaultAllowedEmails = "robin@cognicheck.tech,estienstra@ilionx.com";
const magicLinkTtlMs = 1000 * 60 * 15;
const trackedPages = new Set([
  "/",
  "/index.html",
  "/methodology.html",
  "/methodology-requirements.html",
  "/methodology-analysis.html",
  "/workshop.html",
  "/privacy.html",
  "/demo.html",
  "/Analysis.html",
  "/requirements-page.html",
  "/analytics.html"
]);

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map(cookie => cookie.trim().split("="))
      .filter(([name, value]) => name && value)
  );
}

function signSession(value) {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(value)
    .digest("hex");
}

function getAuthSecret() {
  return process.env.MAGIC_LINK_SECRET || process.env.APP_PASSWORD || process.env.RESEND_API_KEY || "development";
}

function buildLegacySessionToken() {
  return `${sessionCookieValue}.${signSession(sessionCookieValue)}`;
}

function buildSessionToken(email = "") {
  const payload = Buffer.from(JSON.stringify({
    value: sessionCookieValue,
    email: normalizeEmail(email),
    issuedAt: Date.now()
  })).toString("base64url");

  return `${payload}.${signSession(payload)}`;
}

function readSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[sessionCookieName] || "";

  if (token === buildLegacySessionToken()) {
    return { authenticated: true, email: "" };
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || !timingSafeStringEqual(signature, signSession(payload))) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    if (session.value !== sessionCookieValue) {
      return null;
    }

    return {
      authenticated: true,
      email: normalizeEmail(session.email || "")
    };
  } catch {
    return null;
  }
}

function hasValidSession(req) {
  return Boolean(readSession(req));
}

function getSessionEmail(req) {
  return readSession(req)?.email || "";
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function normalizeAllowedEmailEntry(entry = "") {
  const normalizedEntry = normalizeEmail(entry);
  const emailMatch = normalizedEntry.match(/<([^>]+)>/);

  return emailMatch ? normalizeEmail(emailMatch[1]) : normalizedEntry;
}

function getAllowedEmailEntries() {
  return (process.env.ALLOWED_EMAILS || defaultAllowedEmails)
    .split(",")
    .map(entry => normalizeAllowedEmailEntry(entry))
    .filter(Boolean);
}

function isAllowedEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  const emailDomain = normalizedEmail.split("@")[1];

  return getAllowedEmailEntries().some(entry => {
    if (entry.includes("@") && !entry.startsWith("@")) {
      return entry === normalizedEmail;
    }

    const allowedDomain = entry.replace(/^@/, "");
    return allowedDomain && allowedDomain === emailDomain;
  });
}

function isAccessProtectionEnabled() {
  return Boolean(process.env.APP_PASSWORD || getAllowedEmailEntries().length);
}

function passwordsMatch(inputPassword, appPassword) {
  const input = Buffer.from(inputPassword);
  const expected = Buffer.from(appPassword);

  return input.length === expected.length && crypto.timingSafeEqual(input, expected);
}

function timingSafeStringEqual(left = "", right = "") {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function signMagicLinkPayload(payload) {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(payload)
    .digest("base64url");
}

function buildMagicLinkToken(email) {
  const payload = Buffer.from(JSON.stringify({
    email: normalizeEmail(email),
    expiresAt: Date.now() + magicLinkTtlMs
  })).toString("base64url");
  const signature = signMagicLinkPayload(payload);

  return `${payload}.${signature}`;
}

function verifyMagicLinkToken(token = "") {
  const [payload, signature] = token.split(".");

  if (!payload || !signature || !timingSafeStringEqual(signature, signMagicLinkPayload(payload))) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    if (!data.email || !data.expiresAt || Date.now() > data.expiresAt || !isAllowedEmail(data.email)) {
      return null;
    }

    return data.email;
  } catch {
    return null;
  }
}

function getBaseUrl(req) {
  const protocol = req.secure || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  return process.env.APP_BASE_URL || `${protocol}://${req.get("host")}`;
}

async function readProviderError(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function buildMagicLinkEmail(loginUrl) {
  return [
    "Hi,",
    "",
    "Use this link to open CogniCheck:",
    loginUrl,
    "",
    "This link expires in 15 minutes.",
    "",
    "If you did not request this, you can ignore this email."
  ].join("\n");
}

async function sendMagicLinkEmail({ email, loginUrl }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Your CogniCheck access link",
      text: buildMagicLinkEmail(loginUrl)
    })
  });

  if (!response.ok) {
    const providerError = await readProviderError(response);
    console.warn("Magic link email failed:", {
      status: response.status,
      from,
      to: email,
      providerError
    });
    throw new Error("Magic link email could not be sent.");
  }
}

function requireLogin(req, res, next) {
  if (!isAccessProtectionEnabled()) {
    return next();
  }

  const publicPaths = new Set([
    "/",
    "/index.html",
    "/login",
    "/logout",
    "/session",
    "/methodology.html",
    "/methodology-requirements.html",
    "/methodology-analysis.html",
    "/workshop.html",
    "/privacy.html",
    "/content/homepage.json",
    "/css/style.css",
    "/js/homepage.js",
    "/js/analytics-page.js",
    "/js/shared/nav.js",
    "/analysis-screenshot.png",
    "/portrait.png",
    "/favicon.ico"
  ]);

  if (publicPaths.has(req.path)) {
    return next();
  }

  if (hasValidSession(req)) {
    return next();
  }

  if (req.accepts("html")) {
    return res.redirect("/?login=required");
  }

  return res.status(401).json({ error: "Login required." });
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use((req, res, next) => {
  req.sessionEmail = getSessionEmail(req);
  next();
});

// Redirect apex domain to www subdomain
app.use((req, res, next) => {
  const host = req.get("host");
  if (host === "cognicheck.tech") {
    const protocol = req.secure || req.get("x-forwarded-proto") === "https" ? "https" : "http";
    return res.redirect(301, `${protocol}://www.cognicheck.tech${req.originalUrl}`);
  }
  next();
});

// The contact form is public because visitors need to request demos before logging in.
app.use(contactRoutes);

app.post("/login", (req, res) => {
  const appPassword = process.env.APP_PASSWORD;
  const submittedEmail = normalizeEmail(req.body.email || "");
  const submittedPassword = req.body.password || "";

  if (submittedEmail) {
    if (!isValidEmail(submittedEmail) || !isAllowedEmail(submittedEmail)) {
      console.warn(`Rejected CogniCheck login request for ${submittedEmail || "(empty email)"}`);
      return res.json({ success: true });
    }

    const token = buildMagicLinkToken(submittedEmail);
    const loginUrl = `${getBaseUrl(req)}/login?token=${encodeURIComponent(token)}`;

    sendMagicLinkEmail({ email: submittedEmail, loginUrl })
      .then(() => res.json({ success: true }))
      .catch(error => {
        console.warn("Magic link login failed:", error.message);
        res.status(503).json({ error: "Access email could not be sent. Please try again later." });
      });
    return;
  }

  if (appPassword && passwordsMatch(submittedPassword, appPassword)) {
    res.cookie(sessionCookieName, buildSessionToken("password-login"), {
      httpOnly: true,
      sameSite: "lax",
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      maxAge: 1000 * 60 * 60 * 8
    });

    return res.redirect("/demo.html");
  }

  return res.redirect("/?login=failed");
});

app.get("/login", (req, res) => {
  const email = verifyMagicLinkToken(req.query.token || "");

  if (!email) {
    return res.redirect("/?login=failed");
  }

  res.cookie(sessionCookieName, buildSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    maxAge: 1000 * 60 * 60 * 8
  });

  return res.redirect("/demo.html");
});

app.get("/logout", (req, res) => {
  res.clearCookie(sessionCookieName);
  res.redirect("/");
});

app.get("/session", (req, res) => {
  res.json({ authenticated: hasValidSession(req), email: getSessionEmail(req) });
});

app.use(requireLogin);

app.use((req, res, next) => {
  if (req.method === "GET" && trackedPages.has(req.path)) {
    trackPageView(req);
  }

  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use(analyticsRoutes);
app.use(analysisFeedbackRoutes);
app.use(analyzeImageRoutes);
app.use(analyzeRequirementsRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
