// Shared navigation for every page.
// Each HTML page contains <div id="nav"></div>; this script fills that div.
const nav = document.getElementById("nav");

const protectedDemoPaths = new Set([
  "/demo.html",
  "/Analysis.html",
  "/requirements-page.html",
  "/analytics.html"
]);

function t(key, fallback) {
  return window.CogniCheckI18n?.t(key, fallback) || fallback;
}

function renderLanguageControl() {
  return `
    <label class="language-switcher">
      <select data-language-selector aria-label="${t("nav.languageLabel", "Language")}">
        <option value="Dutch">${t("common.dutch", "Nederlands")}</option>
        <option value="English">${t("common.english", "English")}</option>
      </select>
    </label>
  `;
}

function renderPublicNavigation() {
  nav.innerHTML = `
    <nav class="site-nav">
      <a class="nav-brand" href="/">CogniCheck</a>
      <div class="nav-links">
        <a href="/workshop.html">${t("nav.workshop", "Workshop")}</a>
        <a href="/methodology.html">${t("nav.methodology", "Methodology")}</a>
        <a href="/#access">${t("nav.goToCogniCheck", "Go to CogniCheck")}</a>
        <a href="/#about">${t("nav.about", "About")}</a>
        <a href="/privacy.html">${t("nav.privacy", "Privacy")}</a>
        <a href="/#contact">${t("nav.contact", "Contact")}</a>
        ${renderLanguageControl()}
        <a class="nav-demo-button" href="/#contact">${t("nav.bookIntake", "Book an intake")}</a>
      </div>
    </nav>
  `;

  window.CogniCheckI18n?.applyTranslations(nav);
}

function renderProtectedNavigation() {
  nav.innerHTML = `
    <nav class="site-nav">
      <a class="nav-brand" href="/demo.html">CogniCheck</a>
      <div class="nav-links">
        <a href="/demo.html">${t("nav.demoHome", "Demo Home")}</a>
        <a href="/Analysis.html">${t("nav.reportAnalysis", "Report Analysis")}</a>
        <a href="/requirements-page.html">${t("nav.requirementsBlueprint", "Requirements to Blueprint")}</a>
        <a href="/methodology.html">${t("nav.methodology", "Methodology")}</a>
        ${renderLanguageControl()}
        <a href="/logout">${t("nav.logout", "Logout")}</a>
      </div>
    </nav>
  `;

  window.CogniCheckI18n?.applyTranslations(nav);
}

// Methodology pages stay public. Tool pages use the focused demo navigation.
if (nav) {
  if (protectedDemoPaths.has(window.location.pathname)) {
    renderProtectedNavigation();
  } else {
    renderPublicNavigation();
  }

  window.addEventListener("cognicheck:languagechange", () => {
    if (protectedDemoPaths.has(window.location.pathname)) {
      renderProtectedNavigation();
    } else {
      renderPublicNavigation();
    }
  });
}
