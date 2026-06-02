const express = require("express");

const router = express.Router();

const contactToEmail = process.env.CONTACT_TO_EMAIL || "robin@cognicheck.tech";
const contactFromEmail = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanText(value = "", maxLength = 4000) {
  return String(value).trim().slice(0, maxLength);
}

function buildContactEmail({ name, email, message }) {
  return [
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Message:",
    message
  ].join("\n");
}

async function readProviderError(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

router.post("/api/contact", async (req, res) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const name = cleanText(req.body.name, 120);
  const email = cleanText(req.body.email, 200);
  const message = cleanText(req.body.message);

  if (!name || !isValidEmail(email) || !message) {
    return res.status(400).json({ error: "Please provide a valid name, email address and message." });
  }

  if (!resendApiKey) {
    console.warn("Contact form email is not configured. Set RESEND_API_KEY to send contact emails.");
    return res.status(503).json({ error: "Contact form email is not configured yet." });
  }

  try {
    // Email is sent server-side so API keys and the recipient address are not controlled by the browser.
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: contactFromEmail,
        to: contactToEmail,
        reply_to: email,
        subject: `CogniCheck contact: ${name}`,
        text: buildContactEmail({ name, email, message })
      })
    });

    if (!response.ok) {
      const providerError = await readProviderError(response);
      console.warn("Contact email failed:", {
        status: response.status,
        from: contactFromEmail,
        to: contactToEmail,
        providerError
      });
      return res.status(502).json({ error: "Contact email could not be sent." });
    }

    return res.json({ success: true });
  } catch (error) {
    console.warn("Contact email failed:", error.message);
    return res.status(500).json({ error: "Contact email could not be sent." });
  }
});

module.exports = router;
