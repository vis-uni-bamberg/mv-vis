---
title: Multivariate Analysis
---

# Multivariate Analysis

Multivariate analysis deals with many variables simultaneously and aims at discovering potential relationships, patterns, and unexpected observations (outliers). One of the most natural and straightforward visualizations for multivariate data is a **tabular visualization**, similar to what was described earlier. Simply coloring the cells of a table according to their values makes a tabular representation much more efficient to process and allows finding basic patterns. Still, relationships between variables might be harder to see and the ability to show many data items remains limited. In the following, we present different common visualization techniques that are useful in these regards for exploring multivariate data.

```js
import { loadWorld, NUMERIC_VARS, NUMERIC_LABELS } from "./components/dataLoader.js";
import { scatterplot } from "./components/scatterplot.js";
import { scatterplotMatrix } from "./components/scatterplotMatrix.js";
import { parallelCoordinates } from "./components/parallelCoordinates.js";
import { createQuiz } from "./components/quiz.js";

const world = await loadWorld(FileAttachment("./data/world_dataset.csv"));

const numericOptions = new Map(NUMERIC_VARS.map((v) => [NUMERIC_LABELS[v], v]));
```

---

## Scatterplots

With the initial goal to compare the data along two variables, we can create a **scatterplot**. It uses points to represent individual values for two numerical variables in a coordinate system with two dimensions. The position of each point in the coordinate system indicates the values for an individual data item on the horizontal x-axis (first variable) and the vertical y-axis (second variable).

A scatterplot can reveal unexpected gaps in the data or outliers. When we look at the plot as a whole, we may observe a **trend**: if moving from left to right on the x-axis the y-values generally increase, we say the variables are *positively correlated*. Negative correlations show as decreasing values from left to right, while other combinations might not show any clear trend at all.

Hover over any point to identify the country and its exact values.

```js
const sX = view(Inputs.select(numericOptions, { label: "X variable", value: "income" }));
```

```js
const sY = view(Inputs.select(numericOptions, { label: "Y variable", value: "life_expectancy" }));
```

```js
const sColor = view(Inputs.toggle({ label: "Color by region", value: false }));
```

```js
const sSize = view(Inputs.toggle({ label: "Size by population", value: false }));
```

```js
display(scatterplot(world, { xVar: sX, yVar: sY, colorByRegion: sColor, sizeByPop: sSize }))
```

**Task:** Use the controls to observe pairwise relationships (positive, negative, or no correlation) between different pairs of variables.

```js
display(createQuiz({
  question: "Which of the following statements about pairwise correlations is true?",
  answers: [
    { text: "The variables income and life_expectancy are negatively correlated." },
    { text: "There is no clear correlation between babies_per_woman and life_expectancy." },
    { text: "In countries with low income, women are likely to have more babies.", correct: true },
    { text: "The variables income and population have a positive correlation." },
  ],
  incorrectFeedback: "Incorrect. Try setting X = Income and Y = Babies per Woman. Notice the direction of the trend.",
}))
```

A nice property of scatterplots is that they can be visually extended to show data from a few more variables. Use **Color by region** to encode the geographic region of each country, and **Size by population** to encode the country's population as the point radius. You will see, for instance, that African women tend to have more babies while European women are likely to have 2 or fewer. Two Asian countries, China and India (the largest dots), manage to have rather low birth rates despite their relatively low average income.

---

## Scatterplot Matrices

For a more systematic comparison of variables, a **scatterplot matrix** (or pairs plot) shows all possible combinations of scatterplots of the selected variables in a matrix-like organization.

- **Below the diagonal:** Scatterplots for each pair of variables
- **On the diagonal:** Univariate histogram for each variable
- **Above the diagonal:** Pearson correlation coefficient (*r*) — the color intensity indicates the strength of the correlation; blue = positive, red = negative

```js
const smColor = view(Inputs.toggle({ label: "Color by region", value: false }));
```

```js
display(scatterplotMatrix(world, { colorByRegion: smColor }))
```

Now, we can much more quickly check pairwise correlations, both visually and through the correlation coefficients. For instance, we observe a strong positive correlation (usually, *r* > 0.75) between `income` and `health_expenditure`, and an almost as strong but negative correlation between `life_expectancy` and `babies_per_woman`. The scatterplots show potentially interesting outliers in both cases. Hover over any point to identify the country.

```js
display(createQuiz({
  question: "Which pair of variables shows the strongest positive correlation?",
  answers: [
    { text: "income and life_expectancy" },
    { text: "income and health_expenditure", correct: true },
    { text: "population and income" },
    { text: "life_expectancy and babies_per_woman" },
  ],
  incorrectFeedback: "Incorrect. Look at the correlation coefficients above the diagonal and find the largest positive (blue) value.",
}))
```

---

## Parallel Coordinates Plots

With scatterplots and scatterplot matrices, we can see relationships between variables and outliers as unusual combinations of values. However, these are limited to pairwise comparisons. Specifically for detecting similar items, it is desirable to compare more than two numerical variables simultaneously and see clusters or similarity across all these attributes.

A **parallel coordinates plot** supports such comparison. Here, each variable corresponds to a vertical axis. The axes for all variables are placed in parallel and equidistant from each other. A data point is represented as a broken line across all axes. The line intersects each axis at the respective value of the variable for that country. Each line, hence, represents one country.

We reduce the opacity of the lines to better see patterns in dense regions with many line crossings. All axes are normalized to the same 0–1 range so that axes with very different value scales can be compared fairly.

<div class="tip-box">
Note: countries with at least one missing value among the five numeric variables are not shown in this chart.
</div>

```js
const pcpOpacity = view(Inputs.range([0.05, 1.0], { step: 0.05, value: 0.2, label: "Line opacity" }));
```

```js
const pcpColor = view(Inputs.toggle({ label: "Color by region", value: false }));
```

```js
display(parallelCoordinates(world, { opacity: pcpOpacity, colorByRegion: pcpColor }))
```

Now, we get an overview of all data items and all numeric variables. We can observe whether there exists a subset of similar data items regarding these attributes. For instance, we see a large group of small countries with low to medium income and health expenditure, but quite high life expectancy and middle fertility rates. Enable **Color by region** to identify which region dominates that cluster.

**Task:** Enable "Color by region" and identify the dominant region in the cluster of countries with low-to-medium income and health expenditure but high life expectancy.

```js
display(createQuiz({
  question: "Which is the dominant region of the cluster described above (low-to-medium income &amp; health expenditure, high life expectancy)?",
  answers: [
    { text: "Africa" },
    { text: "Asia", correct: true },
    { text: "Europe" },
    { text: "Oceania" },
  ],
  incorrectFeedback: "Incorrect. Enable 'Color by region' and trace the dense bundle of lines with high life expectancy — which color dominates?",
}))
```

---

## Discussion

In contrast to visualizations like histograms and boxplots (which aggregate data), the visualizations in this section do not aggregate data. Instead, they visualize every observation individually and patterns appear in the visual distribution of points (scatterplots) and lines (parallel coordinates plots). Scatterplots only compare two variables at a time, but can be extended to scatterplot matrices for visualization of more variables. However, these matrices are still limited to pairwise comparisons. In contrast, parallel coordinates plots literally connect more variables.

**Scatterplots** are particularly useful for **observing correlations between variables**. Although they do not reveal the precise extent of a correlation, they are very helpful for getting a rough understanding. This even works when the relationship is not linear (for instance, first increasing, then decreasing values), which common numeric correlation coefficients cannot capture. Also, deviations from the general trend can quickly be identified as outliers.

**Parallel coordinates plots** show their strength in providing an **overview across more variables**. Clusters can be discovered by identifying density patterns in line bundles. However, the resulting appearance of the plot depends on the ordering of the axes. While it is easier to see a group of items with similar values in three neighboring axes, it is much harder if these axes are scattered. Unfortunately, different patterns might require different orderings — there generally is no perfect ordering.

In our examples, we have used **categorical variables** for additional color-coding of the points and lines. This is doable for a single categorical variable. A second categorical variable could be encoded in the shape of the points or the stroke of the lines (different dashing styles). However, this approach is limited to a few such variables, having only a few categories each. Although just treating categorical variables as numeric ones and mapping the categories to numbers is doable, this would result in scatterplots and parallel coordinates plots that are hard to interpret, as proximity on the scale no longer has a meaning.

---

## Misinterpretation and Misuse

<div class="warning-box">

- **Correlation does not imply causation.** Scatterplots might be misinterpreted to suggest causation between variables that are just correlated. Correlation is a statistical relationship; causation means one variable truly influences the other. Correlation can stem from a causal relationship, but might also be coincidence or caused by a third unseen factor.

- **The absence of a visual cluster in a parallel coordinates plot does not imply the general absence of clusters.** Axes might just need to be reordered to reveal an existing cluster, or clusters might be subtle and hard to see visually.

</div>
