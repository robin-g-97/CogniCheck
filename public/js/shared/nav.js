// Shared navigation for every page.
// Each HTML page contains <div id="nav"></div>; this script fills that div.
const nav = document.getElementById("nav");

// This guard prevents errors on pages that do not have a nav element.
if (nav) {
  nav.innerHTML = `
    <nav style="background: var(--color-bg-card); border-bottom: 1px solid var(--color-border); padding: 16px 32px;">
      <a href="/" style="color: var(--color-text-primary); font-weight: 700; text-decoration: none;">CogniCheck</a>
      <a href="/Analysis.html" style="color: var(--color-amber); margin-left: 20px;">Analysis</a>
      <a href="/requirements-page.html" style="color: var(--color-amber); margin-left: 20px;">Requirements to Blueprint</a>
    </nav>
  `;
}
