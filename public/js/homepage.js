"use strict";

const homepageRoot = document.getElementById("homepage-content");

function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);

  if (options.className) element.className = options.className;
  if (options.id) element.id = options.id;
  if (options.text) element.textContent = options.text;

  return element;
}

function appendParagraphs(parent, paragraphs = []) {
  paragraphs.forEach(text => {
    parent.appendChild(createElement("p", { text }));
  });
}

function createActions(actions = []) {
  const row = createElement("div", { className: "cta-row" });

  actions.forEach(action => {
    const link = createElement("a", {
      className: `button ${action.variant || "primary"}`,
      text: action.label
    });

    link.href = action.href;
    row.appendChild(link);
  });

  return row;
}

function createCard(card) {
  const article = createElement("article");
  article.appendChild(createElement("h3", { text: card.title }));
  article.appendChild(createElement("p", { text: card.body }));

  return article;
}

function createCards(cards = []) {
  const grid = createElement("div", { className: "cards" });
  cards.forEach(card => grid.appendChild(createCard(card)));

  return grid;
}

function createList(items = []) {
  const list = createElement("ul");
  items.forEach(item => {
    list.appendChild(createElement("li", { text: item }));
  });

  return list;
}

function createLoginForm(loginContent) {
  const form = createElement("form", { className: "login-form" });
  form.action = "/login";
  form.method = "post";

  const label = createElement("label", { text: loginContent.label });
  label.htmlFor = "password";

  const input = createElement("input");
  input.id = "password";
  input.name = "password";
  input.type = "password";
  input.autocomplete = "current-password";
  input.required = true;

  const button = createElement("button", {
    className: "button primary",
    text: loginContent.buttonLabel
  });
  button.type = "submit";

  form.append(label, input, button);
  return form;
}

function createSection(sectionContent, extraClass = "") {
  const section = createElement("section", {
    id: sectionContent.id,
    className: extraClass
  });

  if (sectionContent.eyebrow) {
    section.appendChild(createElement("p", {
      className: "eyebrow",
      text: sectionContent.eyebrow
    }));
  }

  if (sectionContent.title) {
    section.appendChild(createElement(extraClass === "hero" ? "h1" : "h2", {
      text: sectionContent.title
    }));
  }

  if (sectionContent.subtitle) {
    section.appendChild(createElement("p", {
      className: "subtitle",
      text: sectionContent.subtitle
    }));
  }

  appendParagraphs(section, sectionContent.body);

  if (sectionContent.actions) {
    section.appendChild(createActions(sectionContent.actions));
  }

  if (sectionContent.login) {
    section.appendChild(createLoginForm(sectionContent.login));
  }

  if (sectionContent.cards) {
    section.appendChild(createCards(sectionContent.cards));
  }

  if (sectionContent.list) {
    section.appendChild(createList(sectionContent.list));
  }

  return section;
}

async function renderHomepage() {
  try {
    const response = await fetch("/content/homepage.json");
    const content = await response.json();

    homepageRoot.appendChild(createSection(content.hero, "hero"));
    content.sections.forEach(section => {
      homepageRoot.appendChild(createSection(section));
    });
  } catch (error) {
    homepageRoot.appendChild(createElement("p", {
      text: "Homepage content could not be loaded."
    }));
    console.error("Homepage content failed to load:", error);
  }
}

if (homepageRoot) {
  renderHomepage();
}
