require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");

const analyzeImageRoutes = require("./src/routes/analyze-image");
const analyzeRequirementsRoutes = require("./src/routes/analyze-requirements");

const app = express();
const port = process.env.PORT || 3000;
const sessionCookieName = "cognicheck_demo_session";
const sessionCookieValue = "authenticated";

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
    .createHmac("sha256", process.env.APP_PASSWORD || "development")
    .update(value)
    .digest("hex");
}

function buildSessionToken() {
  return `${sessionCookieValue}.${signSession(sessionCookieValue)}`;
}

function hasValidSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[sessionCookieName] === buildSessionToken();
}

function passwordsMatch(inputPassword, appPassword) {
  const input = Buffer.from(inputPassword);
  const expected = Buffer.from(appPassword);

  return input.length === expected.length && crypto.timingSafeEqual(input, expected);
}

function requireLogin(req, res, next) {
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return next();
  }

  const publicPaths = new Set([
    "/",
    "/index.html",
    "/login",
    "/logout",
    "/css/style.css",
    "/js/shared/nav.js",
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
app.post("/login", (req, res) => {
  const appPassword = process.env.APP_PASSWORD;
  const submittedPassword = req.body.password || "";

  if (!appPassword || passwordsMatch(submittedPassword, appPassword)) {
    res.cookie(sessionCookieName, buildSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      maxAge: 1000 * 60 * 60 * 8
    });

    return res.redirect("/Analysis.html");
  }

  return res.redirect("/?login=failed");
});

app.get("/logout", (req, res) => {
  res.clearCookie(sessionCookieName);
  res.redirect("/");
});

app.use(requireLogin);
app.use(express.static(path.join(__dirname, "public")));

app.use(analyzeImageRoutes);
app.use(analyzeRequirementsRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
