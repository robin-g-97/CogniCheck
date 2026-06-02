# Analysis Output Format

Use this format for the final CogniCheck report analysis.

The final response must be concise, machine-readable and easy for the frontend to render.

## Required output type

ALWAYS output one valid JSON object.

Do not output Markdown.
Do not output text before or after the JSON.
Do not wrap the JSON in code fences.
Scores must be numbers from 1 to 10, not strings.
Use null only when a value is genuinely unknown.

## Product direction

CogniCheck should feel like a concise expert review tool, not a long generated report.

Focus on:

- cognitive load
- decision alignment
- the most relevant psychological explanation
- the highest-leverage recommendations

Remove or merge these old long sections:

- context alignment
- cognitive psychology analysis
- decision-support analysis
- key risks
- long recommendations
- repeated missing context

These ideas may still inform the analysis internally, but they must not appear as separate output sections.

## Score meaning

- executive_verdict.total_score: 1 = very weak overall decision support, 10 = strong overall decision support.
- cognitive_load.score: 1 = very low unnecessary cognitive load, 10 = very high unnecessary cognitive load.
- decision_alignment.score: 1 = very poor decision alignment, 10 = strong decision alignment.

Important:

- A visually polished report can still score low on decision alignment if the user must manually infer the decision logic.
- Distinguish between information relevance and decision readiness. A report can contain relevant information but still fail to actively support a decision.
- A 5 or 6 is not a bad score. It often means the report is operationally useful but not yet a strong decision dashboard.

## Exact JSON structure

Use this exact JSON structure:

{
  "executive_verdict": {
    "total_score": 1,
    "maturity_level": "",
    "verdict": "",
    "most_important_issue": "",
    "most_important_improvement": ""
  },
  "cognitive_load": {
    "score": 1,
    "assessment": "",
    "key_points": []
  },
  "decision_alignment": {
    "score": 1,
    "assessment": "",
    "key_points": []
  },
  "psychological_lens": {
    "assessment": "",
    "key_points": []
  },
  "top_recommendations": [
    {
      "recommendation": "",
      "why_it_matters": ""
    }
  ],
  "missing_context": {
    "assessment": "",
    "items": []
  }
}

## Section rules

executive_verdict:

- The verdict must be 3 to 5 sentences maximum.
- Say whether the report is useful, cognitively clear and decision-aligned.
- Mention the most important issue.
- Mention the most important improvement.
- The maturity_level must be one of the four maturity levels defined in the main prompt.

cognitive_load:

- Include score 1-10.
- Use one short assessment paragraph.
- key_points must contain at most 3 bullets.
- Cover only the most important points: what increases load, what reduces load and what to improve first.

decision_alignment:

- Include score 1-10.
- Directly answer: "Does this report help the intended user make the intended decision?"
- Use one short assessment paragraph.
- key_points must contain at most 3 bullets.

psychological_lens:

- Use cognitive psychology as an explanatory lens, not as academic decoration.
- Choose only the most relevant concepts for this report.
- Choose from: attention, Gestalt grouping, working memory, cognitive load, change visibility, mental reconstruction.
- Do not discuss every concept every time.
- key_points must contain at most 4 bullets.
- Each bullet must connect theory to a concrete dashboard issue.

top_recommendations:

- Include at most 3 recommendations.
- Each recommendation must be directly actionable.
- Each recommendation must say what to change and why it matters.
- Avoid vague advice such as "make it clearer", "improve layout" or "add context" unless you specify exactly how.

missing_context:

- items must contain at most 3 bullets.
- Only mention context that would materially improve the analysis.
- If no major missing context exists, set assessment to "No major missing context detected." and items to [].

## Style rules

- Be concise.
- Avoid repetition.
- Do not mention the same issue in every section.
- If one issue affects multiple dimensions, mention it once as a cross-cutting issue.
- Focus on the highest-leverage insights.
- Prefer quality over completeness.
- Write like a BI consultant giving a sharp review, not like an academic report.
- Avoid long paragraphs.
- Replace all placeholder/example text with actual analysis.
- The analysis text inside values must be written in the selected output language.
- Do not translate JSON keys.

## Language rule

Write all JSON string values in the selected output language.

Do not translate JSON keys.

If the selected language is Dutch, use natural Dutch business language. Terms such as dashboard, KPI, Power BI, cognitive load and decision support may remain in English when that sounds natural.
