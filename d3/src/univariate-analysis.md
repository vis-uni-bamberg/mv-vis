---
title: Univariate Analysis
---

# Univariate Analysis

Every variable describes a relevant attribute of the data items. Hence, analyzing the data along only one variable at first (*univariate analysis*) might already provide relevant insights. For instance, we could learn how the items are distributed across a numeric scale (e.g., with a peak around a certain value or evenly across all possible values) or discover noteworthy outliers and extreme values. We will present some simple, yet powerful visualizations to explore such characteristics.

```js
import { loadWorld, NUMERIC_VARS, NUMERIC_LABELS } from "./components/dataLoader.js";
import { itemBars } from "./components/itemBars.js";
import { histogram } from "./components/histogram.js";
import { boxplot } from "./components/boxplot.js";
import { createQuiz } from "./components/quiz.js";

const world = await loadWorld(FileAttachment("./data/world_dataset.csv"));

const numericOptions = new Map(NUMERIC_VARS.map((v) => [NUMERIC_LABELS[v], v]));
const allVarOptions = new Map([
  ...NUMERIC_VARS.map((v) => [NUMERIC_LABELS[v], v]),
  ["Region (categorical)", "region"],
]);
```

---

## Item Bars

A set of numeric values can be generally represented as **bar charts**. This type of diagram is also applicable here and provides maybe the simplest visualization of a single variable. In such a diagram, each data item is represented by a bar and the height of the bar encodes the respective numeric value.

Use the controls below to choose a variable and how many countries to show. Hover over any bar to see the exact value.

```js
const ibVar = view(Inputs.select(numericOptions, { label: "Variable", value: "life_expectancy" }));
```

```js
const ibCount = view(Inputs.radio(
  new Map([["First 8 countries", 8], ["All countries", null]]),
  { label: "Show", value: 8 }
));
```

```js
display(itemBars(world, { variable: ibVar, count: ibCount }))
```

**Task:** Switch to "All countries" and explore the full range of values for `life_expectancy`.

```js
display(createQuiz({
  question: "What range of values do you observe for <code>life_expectancy</code>?",
  answers: [
    { text: "The values are between 20 and 90." },
    { text: "The values are between 30 and 85.", correct: true },
    { text: "The values are between 40 and 85." },
    { text: "The values are between 40 and 90." },
  ],
  incorrectFeedback: "Incorrect. Set 'Show' to 'All countries' and inspect the shortest and tallest bars.",
}))
```

---

## Histograms

With the item bars above, we can read specific values and inspect the data range of a certain variable. While this is a good starting point, we might also want to understand whether the data distribution has a certain peak around a value, which is hard to see in the example above. To this end, **histograms** show how frequent certain values are. A typical example for a histogram, which most likely everybody has seen in school or at university, is a distribution of grades published after an exam.

When there are discrete steps in the data — for instance, the steps of a grading scale — each bar can represent one of these steps. However, for continuous numeric variables, it does not make sense to include a bar for every different value because, most likely, none of the values is repeated. Instead we use **bins** of values that cover a certain range, each of the same width. For generating a histogram, we can either specify the number of bins we want to have or the width of the bins. Here, we use the number of bins as this can be set independently of the scale of the variable.

```js
const histVar = view(Inputs.select(allVarOptions, { label: "Variable", value: "life_expectancy" }));
```

```js
const histBins = view(Inputs.range([3, 50], { step: 1, value: 10, label: "Number of bins" }));
```

```js
display(histogram(world, { variable: histVar, bins: histBins }))
```

**Task:** Change the variable to `babies_per_woman` and analyze how the distribution changes.

```js
display(createQuiz({
  question: "What do you observe for the distribution of values regarding <code>babies_per_woman</code>?",
  answers: [
    { text: "The peak is on the left for small values.", correct: true },
    { text: "The peak is in the middle for medium values." },
    { text: "The peak is on the right for high values." },
    { text: "There is no clear peak." },
  ],
  incorrectFeedback: "Incorrect. Switch the variable to 'Babies per Woman' and look at which side of the histogram the tallest bar appears.",
}))
```

You can also switch the variable to **Region (categorical)** to see how many countries each geographic region contains. Note that for categorical variables there are no bins — each bar represents exactly one category.

---

## Boxplots

Boxplots aggregate the data further by computing statistical properties of the numerical data distribution and visualizing these. Important to understand is that the visualized properties are based on sorting all values that appear for the variable and then cutting them into four equally-sized parts, the **quarters**. For visualization as a boxplot, we are specifically interested in the values at the borders of the quarters, which are called **quartiles**:

- **First quartile** — the value at the border of the first and second quarter
- **Second quartile (median)** — the value in the middle of the sorted list, at the border of the second and third quarter
- **Third quartile** — the value at the border of the third and fourth quarter

Describing the distribution along the quartiles gives a good summary of where there is a peak (mostly around the median) and where the central 50% of the points are (between the first and third quartile). Boxplots draw a box spanning from the first to the third quartile, with a thick white line at the median value.

Vertical lines — the **whiskers** — extend the box at the bottom and top. Each marks how far the distribution stretches in the first and fourth quarter. We discern two cases: if the values in the first/fourth quartile do not stretch too far, the whisker goes to the minimum/maximum value. If there are some values that should rather be considered as **outliers**, the whisker only stretches to the minimum/maximum of the non-outliers and outliers are visualized as separate dots. Usually, values that are more than 1.5 times the **inter-quartile range** (IQR = distance from q1 to q3) above or below the box are considered outliers. Hover over any outlier dot to identify the country.

Enable "Group by region" to place multiple boxplots side by side, one per geographic region, allowing direct comparison of distributions.

```js
const boxVar = view(Inputs.select(numericOptions, { label: "Variable", value: "life_expectancy" }));
```

```js
const boxGrouped = view(Inputs.toggle({ label: "Group by region", value: false }));
```

```js
display(boxplot(world, { variable: boxVar, groupByRegion: boxGrouped }))
```

When grouping by region you can see that, generally, African countries suffer from lower life expectancy than all other regions. Surprisingly, the overall lowest value is located in the Americas.

**Task:** Enable "Group by region" and hover over the outlier dots in the Americas region to identify the country with the lowest `life_expectancy`.

```js
display(createQuiz({
  question: "Which is the country with the lowest value for <code>life_expectancy</code>?",
  answers: [
    { text: "Bolivia" },
    { text: "Guyana" },
    { text: "Haiti", correct: true },
    { text: "Suriname" },
  ],
  incorrectFeedback: "Incorrect. Enable 'Group by region', look at the Americas boxplot, and hover over the outlier dot at the very bottom.",
}))
```

---

## Discussion

We have seen three ways of visualizing a single numeric variable with **increasing levels of aggregation**, from item bars to boxplots. First, the item bars show the data pretty much *as is* and directly map each numeric value to a single bar. When loading many data items, this can quickly become too cluttered as there is not enough space for all the labels and bars get very thin. Also, while one can easily see the general range of data, it is hard to really judge the distribution of data points. For this, histograms are much better. They abstract from individual items and show the frequency of items within specific ranges of values. Here, the range of values as well as peaks become obvious.

Whereas histograms already use some aggregation, boxplots go beyond and are even more space-efficient. In a single column, they show various properties of the data distribution of one variable. Multiple boxplots can be placed next to each other to compare subsets of data items regarding one variable.

Our discussion has focused on numerical variables here, and **categorical variables** cannot be visualized just like that. For instance, for the item bars, there is no numeric value we can map the height of the bar to. Boxplots heavily rely on characterizing quantitative properties such as quartiles, which are not available for categorical variables. Histograms, however, can be applied to categorical data with certain restrictions: we can count for each category how many data items are assigned and visualize these frequency values. Generally, the sorting of the categories is not clearly defined, but sorting by alphabetic order or item frequency often makes sense.

---

## Misinterpretation and Misuse

<div class="warning-box">

Though being simple, the above diagrams can already be misinterpreted or even intentionally misused.

- **Item bars with truncated axis:** You can sometimes see news articles trick their readers by cutting the scale of item bars to visually exaggerate differences and make the story appear more important.
- **Histogram binning:** Too many bins — random variations in the data will likely cause differences of neighboring bars that should not be interpreted as meaningful. Too few bins can hide relevant patterns.
- **Boxplot aggregation:** If there are several distinct peaks, the boxplot would hide this within the main rectangle and appears as if there is a single peak around the shown median value. Hence, boxplots should only be applied when sure that the data distribution has a clear single peak, which can be checked using histograms.

</div>

Toggle the switch below to see how cutting the Y-axis for `life_expectancy` can visually exaggerate differences between countries:

```js
const showTruncated = view(Inputs.toggle({ label: "Show truncated Y-axis (misleading)", value: false }));
```

```js
display(itemBars(world, { variable: "life_expectancy", count: 8, truncateY: showTruncated }))
```
