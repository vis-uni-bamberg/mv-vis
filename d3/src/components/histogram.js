import * as d3 from "npm:d3";
import { validFor } from "./dataLoader.js";
import { NUMERIC_LABELS } from "./dataLoader.js";
import { regionColor, REGIONS } from "./colors.js";

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
 * histogram(data, options) → SVGElement
 *
 * options:
 *   variable  – numeric column name, or "region" for categorical bar chart
 *   bins      – number of bins for numeric mode (default: 10)
 *   width     – SVG width (default: 640)
 *   height    – SVG height (default: 400)
 */
export function histogram(data, {
  variable = "life_expectancy",
  bins = 10,
  width = 640,
  height = 400,
} = {}) {
  return variable === "region"
    ? categoricalBar(data, { width, height })
    : numericHistogram(data, { variable, bins, width, height });
}

function numericHistogram(data, { variable, bins, width, height }) {
  const margin = { top: 24, right: 20, bottom: 60, left: 60 };
  const iw = width - margin.left - margin.right;
  const ih = height - margin.top - margin.bottom;

  const filtered = validFor(data, variable);
  const values = filtered.map((d) => d[variable]);

  const xScale = d3.scaleLinear().domain(d3.extent(values)).nice().range([0, iw]);
  const binner = d3.bin().value((d) => d[variable]).domain(xScale.domain()).thresholds(bins);
  const binsData = binner(filtered);
  const yScale = d3.scaleLinear().domain([0, d3.max(binsData, (b) => b.length)]).nice().range([ih, 0]);

  const svg = d3.create("svg")
    .attr("width", width).attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("max-width", "100%").style("height", "auto");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(xScale).ticks(6));
  g.append("g").call(d3.axisLeft(yScale).ticks(6));

  // Axis labels
  g.append("text").attr("class", "chart-x-label")
    .attr("x", iw / 2).attr("y", ih + 44)
    .attr("text-anchor", "middle")
    .text(NUMERIC_LABELS[variable] || variable);

  g.append("text").attr("class", "chart-y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -ih / 2).attr("y", -44)
    .attr("text-anchor", "middle")
    .text("Count");

  const tooltip = getTooltip();

  g.selectAll("rect.bin")
    .data(binsData)
    .join("rect")
    .attr("class", "bin")
    .attr("x", (b) => xScale(b.x0) + 1)
    .attr("y", (b) => yScale(b.length))
    .attr("width", (b) => Math.max(0, xScale(b.x1) - xScale(b.x0) - 1))
    .attr("height", (b) => ih - yScale(b.length))
    .attr("fill", "#4e79a7")
    .attr("opacity", 0.85)
    .on("mouseover", (event, b) => {
      tooltip.style.display = "block";
      tooltip.innerHTML = `Range: ${d3.format(",.1f")(b.x0)} – ${d3.format(",.1f")(b.x1)}<br>Count: ${b.length}`;
    })
    .on("mousemove", (event) => {
      tooltip.style.left = `${event.clientX + 14}px`;
      tooltip.style.top = `${event.clientY - 36}px`;
    })
    .on("mouseout", () => { tooltip.style.display = "none"; });

  return svg.node();
}

function categoricalBar(data, { width, height }) {
  const margin = { top: 24, right: 20, bottom: 60, left: 60 };
  const iw = width - margin.left - margin.right;
  const ih = height - margin.top - margin.bottom;

  const counts = d3.rollups(data, (v) => v.length, (d) => d.region)
    .filter(([r]) => r)
    .sort((a, b) => d3.ascending(a[0], b[0]));

  const xScale = d3.scaleBand()
    .domain(counts.map(([r]) => r))
    .range([0, iw])
    .padding(0.2);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(counts, ([, c]) => c)])
    .nice()
    .range([ih, 0]);

  const svg = d3.create("svg")
    .attr("width", width).attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("max-width", "100%").style("height", "auto");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(xScale));
  g.append("g").call(d3.axisLeft(yScale).ticks(6));

  g.append("text").attr("class", "chart-x-label")
    .attr("x", iw / 2).attr("y", ih + 44)
    .attr("text-anchor", "middle").text("Region");

  g.append("text").attr("class", "chart-y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -ih / 2).attr("y", -44)
    .attr("text-anchor", "middle").text("Number of Countries");

  const tooltip = getTooltip();

  g.selectAll("rect.cat-bar")
    .data(counts)
    .join("rect")
    .attr("class", "cat-bar")
    .attr("x", ([r]) => xScale(r))
    .attr("y", ([, c]) => yScale(c))
    .attr("width", xScale.bandwidth())
    .attr("height", ([, c]) => ih - yScale(c))
    .attr("fill", ([r]) => regionColor(r))
    .attr("opacity", 0.85)
    .on("mouseover", (event, [r, c]) => {
      tooltip.style.display = "block";
      tooltip.innerHTML = `<strong>${r}</strong><br>Countries: ${c}`;
    })
    .on("mousemove", (event) => {
      tooltip.style.left = `${event.clientX + 14}px`;
      tooltip.style.top = `${event.clientY - 36}px`;
    })
    .on("mouseout", () => { tooltip.style.display = "none"; });

  return svg.node();
}
