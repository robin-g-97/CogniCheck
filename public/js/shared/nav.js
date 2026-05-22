// Shared navigation for every page.
// Each HTML page contains <div id="nav"></div>; this script fills that div.
const nav = document.getElementById("nav");

// This guard prevents errors on pages that do not have a nav element.
if (nav) {
  nav.innerHTML = `
    <nav class="site-nav">
      <a class="nav-brand" href="/">CogniCheck</a>
      <div class="nav-links">
        <a href="/#features">Features</a>
        <a href="/#methodology">Methodology</a>
        <a href="/#workshops">Workshops</a>
        <a href="/#about">About</a>
        <a href="/#contact">Contact</a>
        <a class="nav-demo-button" href="/#contact">Request demo</a>
      </div>
    </nav>
  `;

  fetch("/session")
    .then(response => response.json())
    .then(session => {
      if (!session.authenticated) return;

      nav.insertAdjacentHTML("beforeend", `
        <nav class="demo-nav" aria-label="Demo pages">
          <span>Demo pages</span>
          <a href="/Analysis.html">Analysis demo</a>
          <a href="/requirements-page.html">Blueprint demo</a>
          <a href="/logout">Log out</a>
        </nav>
      `);
    })
    .catch(() => {
      // If the session check fails, keep the normal public navigation.
    });
}
