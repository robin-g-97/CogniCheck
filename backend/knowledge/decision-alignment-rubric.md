# Decision Alignment Rubric

Use this rubric to evaluate whether a BI report helps the intended user make the intended decision.

Score from 1 to 10.

- 1 = very poor decision alignment
- 5 = partial decision alignment
- 10 = strong decision alignment

## Main evaluation question

Does this report help the intended user make the intended decision?

## Core idea

A report is decision-aligned when the user can understand:

1. What is happening.
2. Why it matters.
3. Whether action is needed.
4. What action or next step is reasonable.

A report can be visually attractive and technically correct but still poorly aligned with the decision.

## Evaluation dimensions

### 1. Audience fit

Check whether the report matches the intended audience.

High alignment indicators:

- terminology fits the audience
- detail level fits the user expertise
- the report answers the user's likely questions
- the report supports the user's responsibilities

Low alignment indicators:

- too technical for business users
- too simplified for expert users
- uses unexplained terms or acronyms
- emphasizes information the audience cannot act on

### 2. Decision fit

Check whether the report directly supports the stated decision.

High alignment indicators:

- the main decision is visible in the report structure
- relevant KPIs are present
- trade-offs are visible
- the report shows whether action is needed

Low alignment indicators:

- the report shows many metrics but no clear decision signal
- relevant decision criteria are missing
- the report answers a different question than the stated decision
- the user must infer the decision manually

### 3. KPI relevance

Check whether the KPIs are relevant, understandable and actionable.

High alignment indicators:

- KPIs are connected to the decision
- KPI definitions are clear or known in context
- targets or thresholds are available where needed
- KPIs are not redundant

Low alignment indicators:

- KPIs are unclear or undefined
- KPIs are not connected to action
- important KPIs are missing
- too many KPIs compete for attention

### 4. Context sufficiency

Check whether the report provides enough context to interpret the numbers.

High alignment indicators:

- benchmarks, targets or historical comparisons are present
- trends and deviations are easy to understand
- time periods are clear
- filters and scope are visible

Low alignment indicators:

- no target or benchmark
- unclear time period
- unclear scope or filters
- deviations are shown without explanation or consequence

### 5. Actionability

Check whether the report helps the user decide what to do next.

High alignment indicators:

- risks or exceptions are clearly marked
- the report points toward possible next steps
- the user can distinguish normal variation from urgent deviation
- priorities are clear

Low alignment indicators:

- the report only describes status
- no indication of urgency
- no thresholds or decision rules
- the report does not help prioritize action

### 6. Usage context fit

Check whether the design fits how and when the report is used.

High alignment indicators:

- operational reports support fast recognition
- strategic reports allow deeper interpretation
- meeting reports support discussion and shared understanding
- recurring reports make change visible over time

Low alignment indicators:

- too much detail for fast operational use
- too little context for strategic use
- too much volatility for recurring review
- not enough explanation for occasional users

## Score guidance

### 1-3: Poor decision alignment

The report does not clearly support the stated decision. Important information is missing, unclear or not actionable.

### 4-6: Partial decision alignment

The report supports the decision to some extent, but users still need to infer meaning, search for context or reconstruct the decision logic.

### 7-8: Good decision alignment

The report mostly supports the intended decision. Some improvements are possible, but the user can generally understand what matters and why.

### 9-10: Strong decision alignment

The report is clearly built around the intended decision. The audience, KPIs, context and action signals are well aligned.

## Recommendation style

Recommendations should connect design issues to decision quality.

Example:

"The dashboard shows revenue and churn, but does not show the threshold at which action is required. Add a target band or decision rule so users can distinguish normal fluctuation from intervention-worthy change."