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

// Media helper: used by the hero and about section.
function createImage(imageContent, className) {
  const image = createElement("img", { className });
  image.src = imageContent.src;
  image.alt = imageContent.alt;
  image.loading = "lazy";

  // If the image file is not present yet, hide the empty image box.
  image.addEventListener("error", () => {
    image.style.display = "none";
  });

  return image;
}

function createCard(card) {
  const article = createElement("article");
  article.appendChild(createElement("h3", { text: card.title }));
  article.appendChild(createElement("p", { text: card.body }));

  if (card.href) {
    const link = createElement("a", {
      className: "card-link",
      text: card.label || "Open"
    });
    link.href = card.href;
    article.appendChild(link);
  }

  return article;
}

function createCards(cards = [], cardStyle = "") {
  const grid = createElement("div", {
    className: ["cards", cardStyle === "navigation" ? "demo-cards" : ""].filter(Boolean).join(" ")
  });
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

// Workflow helper: creates a simple numbered flow from JSON.
function createSteps(steps = []) {
  const flow = createElement("ol", { className: "workflow-steps" });

  steps.forEach(step => {
    const item = createElement("li");
    item.appendChild(createElement("span", { text: step }));
    flow.appendChild(item);
  });

  return flow;
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

function createField(id, labelText, type = "text") {
  const group = createElement("div", { className: "form-field" });
  const label = createElement("label", { text: labelText });
  label.htmlFor = id;

  const input = createElement("input");
  input.id = id;
  input.name = id;
  input.type = type;
  input.required = true;

  group.append(label, input);
  return { group, input };
}

function createSelectField(id, labelText, options = []) {
  const group = createElement("div", { className: "form-field" });
  const label = createElement("label", { text: labelText });
  const select = createElement("select");

  label.htmlFor = id;
  select.id = id;
  select.name = id;
  select.required = true;

  options.forEach(optionText => {
    const option = createElement("option", { text: optionText });
    option.value = optionText;
    select.appendChild(option);
  });

  group.append(label, select);
  return { group, input: select };
}

function createContactForm(contactContent) {
  const form = createElement("form", { className: "contact-form" });
  form.action = "/api/contact";
  form.method = "post";

  const nameField = createField("contact-name", contactContent.nameLabel);
  const emailField = createField("contact-email", contactContent.emailLabel, "email");
  const organizationField = contactContent.organizationLabel
    ? createField("contact-organization", contactContent.organizationLabel)
    : null;
  const interestField = contactContent.interestLabel
    ? createSelectField("contact-interest", contactContent.interestLabel, contactContent.interestOptions || [])
    : null;

  const messageGroup = createElement("div", { className: "form-field" });
  const messageLabel = createElement("label", { text: contactContent.messageLabel });
  messageLabel.htmlFor = "contact-message";

  const messageInput = createElement("textarea");
  messageInput.id = "contact-message";
  messageInput.name = "contact-message";
  messageInput.placeholder = contactContent.messagePlaceholder;
  messageInput.required = true;
  messageInput.rows = 5;

  messageGroup.append(messageLabel, messageInput);

  const button = createElement("button", {
    className: "button primary",
    text: contactContent.buttonLabel
  });
  button.type = "submit";

  const status = createElement("p", { className: "contact-form-status" });

  form.append(
    nameField.group,
    emailField.group,
    ...(organizationField ? [organizationField.group] : []),
    ...(interestField ? [interestField.group] : []),
    messageGroup,
    button,
    status
  );

  form.addEventListener("submit", async event => {
    event.preventDefault();
    status.textContent = "";
    status.className = "contact-form-status";
    button.disabled = true;
    button.textContent = contactContent.sendingLabel || "Sending...";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameField.input.value,
          email: emailField.input.value,
          organization: organizationField?.input.value || "",
          interest: interestField?.input.value || "",
          message: messageInput.value
        })
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error || "Contact request failed.");
      }

      form.reset();
      status.textContent = contactContent.successMessage || "Thanks, your message has been sent.";
      status.classList.add("contact-form-status-success");
    } catch (error) {
      console.error("Contact form failed:", error);
      status.textContent = contactContent.errorMessage || "The message could not be sent. Please try again later.";
      status.classList.add("contact-form-status-error");
    } finally {
      button.disabled = false;
      button.textContent = contactContent.buttonLabel;
    }
  });

  return form;
}

function createDirectEmailLink(contactContent) {
  if (!contactContent.directEmail) return null;

  const wrapper = createElement("p", { className: "direct-email" });
  const label = contactContent.directEmailLabel ? `${contactContent.directEmailLabel} ` : "";
  const text = contactContent.directEmailText || "Mail me directly at";
  const link = createElement("a", { text: contactContent.directEmail });
  const mailtoUrl = new URL(`mailto:${contactContent.directEmail}`);

  mailtoUrl.searchParams.set("subject", "CogniCheck contact");
  link.href = mailtoUrl.toString();
  wrapper.append(label, `${text} `, link, ".");

  return wrapper;
}

function appendSectionText(parent, sectionContent, headingTag) {
  if (sectionContent.eyebrow) {
    parent.appendChild(createElement("p", {
      className: "eyebrow",
      text: sectionContent.eyebrow
    }));
  }

  if (sectionContent.title) {
    parent.appendChild(createElement(headingTag, { text: sectionContent.title }));
  }

  if (sectionContent.subtitle) {
    parent.appendChild(createElement("p", {
      className: "subtitle",
      text: sectionContent.subtitle
    }));
  }

  appendParagraphs(parent, sectionContent.body);
}

// Hero section: text on the left, screenshot on the right.
function createHero(heroContent) {
  const section = createElement("section", { className: "hero" });
  const textColumn = createElement("div", { className: "hero-content" });

  appendSectionText(textColumn, heroContent, "h1");

  if (heroContent.actions) {
    textColumn.appendChild(createActions(heroContent.actions));
  }

  section.appendChild(textColumn);

  if (heroContent.image) {
    const mediaColumn = createElement("div", { className: "hero-media" });
    mediaColumn.appendChild(createImage(heroContent.image, "hero-image"));
    section.appendChild(mediaColumn);
  }

  return section;
}

function createSection(sectionContent, extraClass = "") {
  const section = createElement("section", {
    id: sectionContent.id,
    className: [extraClass, sectionContent.layout === "media" ? "media-section" : ""].filter(Boolean).join(" ")
  });

  const content = createElement("div", { className: "section-content" });
  appendSectionText(content, sectionContent, "h2");

  if (sectionContent.actions) {
    content.appendChild(createActions(sectionContent.actions));
  }

  if (sectionContent.contactForm) {
    content.appendChild(createContactForm(sectionContent.contactForm));
    const directEmailLink = createDirectEmailLink(sectionContent.contactForm);
    if (directEmailLink) content.appendChild(directEmailLink);
  }

  if (sectionContent.login) {
    content.appendChild(createLoginForm(sectionContent.login));
  }

  if (sectionContent.list) {
    content.appendChild(createList(sectionContent.list));
  }

  if (sectionContent.steps) {
    content.appendChild(createSteps(sectionContent.steps));
  }

  section.appendChild(content);

  if (sectionContent.cards) {
    section.appendChild(createCards(sectionContent.cards, sectionContent.cardStyle));
  }

  if (sectionContent.image) {
    section.appendChild(createImage(sectionContent.image, "section-image"));
  }

  return section;
}

async function renderHomepage() {
  try {
    const response = await fetch("/content/homepage.json");
    const content = await response.json();

    homepageRoot.appendChild(createHero(content.hero));
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
