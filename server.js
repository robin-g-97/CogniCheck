require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const analyzeImageRoutes = require("./src/routes/analyze-image");
const analyzeRequirementsRoutes = require("./src/routes/analyze-requirements");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use(analyzeImageRoutes);
app.use(analyzeRequirementsRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
