---
title: Multivariate Data
---

# Multivariate Data

Before presenting and discussing different visualization options, we first explain what exactly we consider as *multivariate data*. We also introduce a specific dataset that we use as our running example throughout this tutorial.

Multivariate data, as focused in this tutorial, concerns any data that can be represented as:

- **Data items** that represent real-world objects, persons, organizations, etc., and
- **Variables** that characterize these items and can be considered as properties or attributes of the items.

Since all items of one dataset are described along the same variables, it is important that the items belong to the same class of objects. Otherwise, it would be hard to apply the same variables. For instance, mixing persons with countries in one dataset, it would be hard to find any attributes that apply to both classes of items alike.

Aside from identifiers and names, we can discern between two main data types for variables:

- **Numeric** variables, which encode some type of number (e.g., positive integers for quantities, float numbers 0.0 to 1.0 for fractions).
- **Categorical** variables, which assign a data item to a certain category (e.g., a country item to a region category).

Hence, these two types encode quantitative and qualitative information. While numeric variables can be sorted in increasing or decreasing order, categorical variables often cannot. Please note that sometimes categorical variables are encoded as numbers (e.g., a numeric country code) — analyzing them as numeric variables would result in invalid results.

## Our Sample Dataset

We have selected a dataset that is easy to understand, yet of high relevance to many disciplines. It lists the **countries of the world** as data items and characterizes them along **social and economic properties in 2010** as variables. The data is based on free material from [GAPMINDER.ORG](https://www.gapminder.org), CC-BY LICENSE.

The table below shows the first six rows of the dataset. You can see that it contains mostly numeric variables, but also a column with an identifier (the country name) and one with a categorical variable (the region).

```js
import { loadWorld } from "./components/dataLoader.js";
const world = await loadWorld(FileAttachment("./data/world_dataset.csv"));
```

```js
Inputs.table(world.slice(0, 6))
```

The dataset contains the following variables:

- `country` (identifier) — the name of the country
- `region` (categorical) — the geographic region the country is located in
- `population` (numeric) — the number of inhabitants of a country
- `income` (numeric) — the gross domestic product (i.e., the average economic production) per citizen in international dollars
- `health_expenditure` (numeric) — the average health spending per citizen in USD
- `life_expectancy` (numeric) — the expected number of years a newborn child would live under current conditions
- `babies_per_woman` (numeric) — the fertility rate, which is the number of babies that would be born per woman under current conditions

You can also observe some missing values (`null` — *not available*). It is a common problem in all real-world data that, due to different reasons, there are gaps and quality issues in the data. We intentionally kept the countries with such missing data to literally draw a more realistic picture of the data. Please note, however, that the visualizations in the following sections will silently omit data points with missing values for the displayed variable.
