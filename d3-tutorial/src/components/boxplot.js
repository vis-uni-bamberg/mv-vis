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

function computeStats(values, rows) {
  const sorted = values.slice().sort(d3.ascending);
  const q1 = d3.quantile(sorted, 0.25);
  const median = d3.quantile(sorted, 0.5);
  const q3 = d3.quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const whiskerLow = Math.max(d3.min(sorted), q1 - 1.5 * iqr);
  const whiskerHigh = Math.min(d3.max(sorted), q3 + 1.5 * iqr);
  const outliers = rows.filter((d) => {
    const v = d._val;
    return v < whiskerLow || v > whiskerHigh;
  });
  return { q1, median, q3, iqr, whiskerLow, whiskerHigh, outliers };
}

/**
 * boxplot(data, options) → SVGElement
 *
 * options:
 *   variable      – numeric column (default: "life_expectancy")
 *   groupByRegion – false = single box, true = one per region (default: false)
 *   width         – SVG width (default: 640)
 *   height        – SVG height (default: 420)
 */
export function boxplot(data, {
  variable = "life_expectancy",
  groupByRegion = false,
  width = 640,
  height = 420,
} = {}) {
  const margin = { top: 24, right: 30, bottom: 60, left: 70 };
  const iw = width - margin.left - margin.right;
  const ih = height - margin.top - margin.bottom;

  const filtered = validFor(data, variable).map((d) => ({ ...d, _val: d[variable] }));

  // Build groups
  let groups;
  if (groupByRegion) {
    groups = REGIONS.map((region) => ({
      key: region,
      rows: filtered.filter((d) => d.region === region),
    })).filter((g) => g.rows.length > 0);
  } else {
    groups = [{ key: "all", rows: filtered }];
  }

  groups.forEach((g) => {
    const vals = g.rows.map((d) => d._val);
    g.stats = computeStats(vals, g.rows);
  });

  const allVals = filtered.map((d) => d._val);
  const yScale = d3.scaleLinear()
    .domain([d3.min(allVals) * 0.97, d3.max(allVals) * 1.03])
    .nice()
    .range([ih, 0]);

  const xScale = d3.scaleBand()
    .domain(groups.map((g) => g.key))
    .range([0, iw])
    .padding(groupByRegion ? 0.3 : 0.7);

  const svg = d3.create("svg")
    .attr("width", width).attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("max-width", "100%").style("height", "auto");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g").attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(xScale).tickSize(groupByRegion ? 4 : 0))
    .selectAll("text")
    .style("font-size", "12px");

  g.append("g").call(d3.axisLeft(yScale).ticks(6));

  g.append("text").attr("class", "chart-y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -ih / 2).attr("y", -52)
    .attr("text-anchor", "middle")
    .text(NUMERIC_LABELS[variable] || variable);

  const tooltip = getTooltip();
  const bw = xScale.bandwidth();

  groups.forEach(({ key, rows, stats }) => {
    const cx = xScale(key) + bw / 2;
    const fill = groupByRegion ? regionColor(key) : "#4e79a7";
    const gc = g.append("g").attr("class", "boxplot-group");

    // Vertical line spanning full whisker range
    gc.append("line")
      .attr("x1", cx).attr("x2", cx)
      .attr("y1", yScale(stats.whiskerLow))
      .attr("y2", yScale(stats.whiskerHigh))
      .attr("stroke", "#444").attr("stroke-width", 1.5);

    // Whisker caps
    [[stats.whiskerLow], [stats.whiskerHigh]].forEach(([w]) => {
      gc.append("line")
        .attr("x1", cx - bw * 0.25).attr("x2", cx + bw * 0.25)
        .attr("y1", yScale(w)).attr("y2", yScale(w))
        .attr("stroke", "#444").attr("stroke-width", 1.5);
    });

    // Box
    gc.append("rect")
      .attr("x", xScale(key))
      .attr("y", yScale(stats.q3))
      .attr("width", bw)
      .attr("height", yScale(stats.q1) - yScale(stats.q3))
      .attr("fill", fill)
      .attr("opacity", 0.75)
      .attr("stroke", "#333")
      .attr("stroke-width", 1);

    // Median line
    gc.append("line")
      .attr("x1", xScale(key)).attr("x2", xScale(key) + bw)
      .attr("y1", yScale(stats.median)).attr("y2", yScale(stats.median))
      .attr("stroke", "white").attr("stroke-width", 2.5);

    // Outliers
    gc.selectAll("circle.outlier")
      .data(stats.outliers)
      .join("circle")
      .attr("class", "outlier")
      .attr("cx", cx)
      .attr("cy", (d) => yScale(d._val))
      .attr("r", 3.5)
      .attr("fill", fill)
      .attr("stroke", "#333")
      .attr("stroke-width", 0.7)
      .attr("opacity", 0.8)
      .on("mouseover", (event, d) => {
        tooltip.style.display = "block";
        tooltip.innerHTML = `<strong>${d.country}</strong><br>${NUMERIC_LABELS[variable] || variable}: ${d3.format(",.2f")(d._val)}`;
      })
      .on("mousemove", (event) => {
        tooltip.style.left = `${event.clientX + 14}px`;
        tooltip.style.top = `${event.clientY - 36}px`;
      })
      .on("mouseout", () => { tooltip.style.display = "none"; });
  });

  // Legend when grouped
  if (groupByRegion) {
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left + iw + 8}, ${margin.top})`);
    groups.forEach(({ key }, i) => {
      legend.append("rect").attr("x", 0).attr("y", i * 18).attr("width", 12).attr("height", 12)
        .attr("fill", regionColor(key)).attr("opacity", 0.75);
      legend.append("text").attr("x", 16).attr("y", i * 18 + 10)
        .style("font-size", "11px").text(key);
    });
  }

  return svg.node();
}
