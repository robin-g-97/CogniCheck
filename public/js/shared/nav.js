// Shared navigation for every page.
// Each HTML page contains <div id="nav"></div>; this script fills that div.
const nav = document.getElementById("nav");

const protectedDemoPaths = new Set([
  "/demo.html",
  "/Analysis.html",
  "/requirements-page.html",
  "/analytics.html"
]);

function renderPublicNavigation() {
  nav.innerHTML = `
    <nav class="site-nav">
      <a class="nav-brand" href="/">CogniCheck</a>
      <div class="nav-links">
        <a href="/workshop.html">Workshop</a>
        <a href="/methodology.html">Methodology</a>
        <a href="/#access">Go to CogniCheck</a>
        <a href="/#about">About</a>
        <a href="/privacy.html">Privacy</a>
        <a href="/#contact">Contact</a>
        <a class="nav-demo-button" href="/#contact">Book an intake</a>
      </div>
    </nav>
  `;
}

function renderProtectedNavigation() {
  nav.innerHTML = `
    <nav class="site-nav">
      <a class="nav-brand" href="/demo.html">CogniCheck</a>
      <div class="nav-links">
        <a href="/demo.html">Demo Home</a>
        <a href="/Analysis.html">Report Analysis</a>
        <a href="/requirements-page.html">Requirements to Blueprint</a>
        <a href="/methodology.html">Methodology</a>
        <a href="/logout">Logout</a>
      </div>
    </nav>
  `;
}

// Methodology pages stay public. Tool pages use the focused demo navigation.
if (nav) {
  if (protectedDemoPaths.has(window.location.pathname)) {
    renderProtectedNavigation();
  } else {
    renderPublicNavigation();
  }
}
