function requirementsBlueprintPrompt(text) {
  return `You are a Senior Power BI Architect. Analyze the following requirements document and provide structured feedback.
Format your entire response as valid HTML that can be injected directly into a <div>.
Use <h2> for section headings, <ul> and <li> for lists, <strong> for emphasis, and <p> for paragraphs.
Do not include <html>, <head>, <body>, or any outer wrapper tags - only the inner content.
Structure your response with these four sections:
<h2>Key Requirements</h2>
<h2>Unchecked Assumptions</h2>
<h2>Risks & Issues</h2>
<h2>Power BI Blueprint</h2>
Here are the requirements:
${text}`;
}

module.exports = {
  requirementsBlueprintPrompt
};
