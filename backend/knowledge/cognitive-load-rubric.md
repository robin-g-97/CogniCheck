# Cognitive Load Rubric

Use this rubric to evaluate the cognitive load of BI reports and dashboards.

Score from 1 to 10.

- 1 = very low cognitive load
- 5 = moderate cognitive load
- 10 = very high cognitive load

The score should reflect unnecessary cognitive effort, not the inherent complexity of the business problem.

## Main evaluation question

How much unnecessary mental effort does the report require from the user?

## Evaluation dimensions

### 1. Visual complexity

Check whether the report contains too many visuals, labels, colours, filters, legends or competing elements.

High load indicators:

- too many visuals on one page
- dense tables without hierarchy
- many colours without clear meaning
- decorative elements that compete with data
- unclear visual priority

Low load indicators:

- clear page structure
- limited visual competition
- consistent design language
- important information is easy to find

### 2. Attention competition

Check whether multiple elements fight for attention.

High load indicators:

- many elements use strong colour or contrast
- navigation, filters or labels are more salient than the main insight
- alerts, KPIs and charts all compete visually

Low load indicators:

- one clear visual priority
- colour is used intentionally
- deviations stand out without overwhelming the page

### 3. Information density

Check whether the amount of information fits the usage context.

High load indicators:

- too much detail for a quick decision
- no separation between overview and detail
- too many KPIs shown at the same level

Low load indicators:

- overview first, detail second
- relevant information is grouped
- density matches the audience and decision context

### 4. Mental reconstruction

Check whether the user has to combine scattered information manually.

High load indicators:

- comparisons are spread across the page
- users must remember values from one visual to interpret another
- targets, thresholds or previous periods are missing
- relationships between visuals are unclear

Low load indicators:

- key comparisons are visible directly
- context is placed close to the relevant metric
- trends and deviations are explicit

### 5. Visual hierarchy

Check whether the report communicates what matters most.

High load indicators:

- everything looks equally important
- primary and secondary information are not separated
- titles do not explain the message

Low load indicators:

- clear hierarchy between page title, KPIs, charts and detail
- important signals are visually prioritized
- section grouping supports interpretation

### 6. Change visibility

Check whether differences, trends and deviations are easy to see.

High load indicators:

- changes must be inferred manually
- no reference period or benchmark
- filter changes make the page shift without stable reference points

Low load indicators:

- deltas, thresholds and trends are explicit
- deviations are marked clearly
- stable reference points are present

## Score guidance

### 1-3: Low cognitive load

The report is easy to scan. The main message is visible. Users can understand the most important signals without much effort.

### 4-6: Moderate cognitive load

The report is usable, but some interpretation requires effort. There may be minor attention competition, unclear grouping or missing context.

### 7-8: High cognitive load

The report requires substantial mental effort. Users must reconstruct meaning, search for signals or interpret unclear relationships.

### 9-10: Very high cognitive load

The report is cognitively overloaded. It is difficult to identify what matters, what changed, or what action is needed.

## Recommendation style

For each issue, explain:

1. What creates the load.
2. Why it matters for the user.
3. What should be changed.

Example:

"The KPI cards and navigation elements use similar visual weight. This creates attention competition. Reduce the emphasis on navigation and reserve strong colour for the main decision signal."