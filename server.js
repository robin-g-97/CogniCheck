require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const analyzeImageRoutes = require("./src/routes/analyze-image");
const analyzeRequirementsRoutes = require("./src/routes/analyze-requirements");

const app = express();
const port = process.env.PORT || 3000;

function requirePassword(req, res, next) {
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="CogniCheck"');
    return res.status(401).send("Password required");
  }

  const encodedCredentials = authHeader.slice("Basic ".length);
  const decodedCredentials = Buffer.from(encodedCredentials, "base64").toString("utf8");
  const password = decodedCredentials.slice(decodedCredentials.indexOf(":") + 1);

  if (password !== appPassword) {
    res.setHeader("WWW-Authenticate", 'Basic realm="CogniCheck"');
    return res.status(401).send("Invalid password");
  }

  next();
}

app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use(analyzeImageRoutes);
app.use(analyzeRequirementsRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
