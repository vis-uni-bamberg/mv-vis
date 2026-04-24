import * as d3 from "npm:d3";
import { validFor } from "./dataLoader.js";
import { NUMERIC_LABELS } from "./dataLoader.js";

function getTooltip() {
  let tip = document.getElementById("mv-tooltip");
  if (!tip) {
    tip = document.createElement("div");
    tip.id = "mv-tooltip";
    tip.style.cssText =
      "position:fixed;pointer-events:none;display:none;background:rgba(0,0,0,0.82);" +
      "color:#fff;padding:6px 10px;border-radius:4px;font-size:12px;line-height:1.5;z-index:9999;";
    document.body.appendChild(tip);
  }
  return tip;
}

/**
 * itemBars(data, options) → SVGElement
 *
 * options:
 *   variable     – numeric column name (default: "life_expectancy")
 *   count        – number of countries to show, null = all (default: null)
 *   truncateY    – start Y-axis at 90th-pctile min to show misuse (default: false)
 *   width        – SVG width in px (default: 900)
 *   height       – SVG height in px (default: 420)
 */
export function itemBars(data, {
  variable = "life_expectancy",
  count = null,
  truncateY = false,
  width = 900,
  height = 420,
} = {}) {
  const margin = { top: 24, right: 20, bottom: 100, left: 70 };
  const iw = width - margin.left - margin.right;
  const ih = height - margin.top - margin.bottom;

  let filtered = validFor(data, variable).slice().sort((a, b) => a.country.localeCompare(b.country));
  if (count !== null) filtered = filtered.slice(0, count);

  const xScale = d3.scaleBand()
    .domain(filtered.map((d) => d.country))
    .range([0, iw])
    .padding(0.15);

  const values = filtered.map((d) => d[variable]);
  const yMin = truncateY ? d3.quantile(values.slice().sort(d3.ascending), 0.5) : 0;
  const yMax = d3.max(values) * 1.05;

  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([ih, 0]).nice();

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("max-width", "100%")
    .style("height", "auto");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(xScale).tickSize(0))
    .selectAll("text")
    .attr("transform", "rotate(-60)")
    .style("text-anchor", "end")
    .attr("dx", "-0.5em")
    .attr("dy", "0.15em")
    .style("font-size", "10px");

  g.append("g").call(d3.axisLeft(yScale).ticks(6));

  // Y label
  g.append("text")
    .attr("class", "chart-y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -ih / 2)
    .attr("y", -52)
    .attr("text-anchor", "middle")
    .text(NUMERIC_LABELS[variable] || variable);

  // Bars
  const tooltip = getTooltip();

  g.selectAll("rect.bar")
    .data(filtered)
    .join("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.country))
    .attr("y", (d) => yScale(d[variable]))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => ih - yScale(d[variable]))
    .attr("fill", "#4e79a7")
    .attr("opacity", 0.85)
    .on("mouseover", (event, d) => {
      tooltip.style.display = "block";
      tooltip.innerHTML = `<strong>${d.country}</strong><br>${NUMERIC_LABELS[variable] || variable}: ${d3.format(",.1f")(d[variable])}`;
    })
    .on("mousemove", (event) => {
      tooltip.style.left = `${event.clientX + 14}px`;
      tooltip.style.top = `${event.clientY - 36}px`;
    })
    .on("mouseout", () => { tooltip.style.display = "none"; });

  // Truncation warning annotation
  if (truncateY) {
    svg.append("text")
      .attr("x", margin.left)
      .attr("y", height - 4)
      .attr("fill", "#c0392b")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .text("⚠ Warning: Y-axis does not start at 0 — differences are visually exaggerated!");
  }

  return svg.node();
}
