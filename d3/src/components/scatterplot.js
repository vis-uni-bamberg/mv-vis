import * as d3 from "npm:d3";
import { validForAll } from "./dataLoader.js";
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
 * scatterplot(data, options) → SVGElement
 *
 * options:
 *   xVar            – x-axis numeric column (default: "income")
 *   yVar            – y-axis numeric column (default: "life_expectancy")
 *   colorByRegion   – color points by region (default: false)
 *   sizeByPop       – size points by population (default: false)
 *   width           – SVG width (default: 660)
 *   height          – SVG height (default: 440)
 */
export function scatterplot(data, {
  xVar = "income",
  yVar = "life_expectancy",
  colorByRegion = false,
  sizeByPop = false,
  width = 660,
  height = 440,
} = {}) {
  const legendW = colorByRegion ? 110 : 0;
  const margin = { top: 24, right: 20 + legendW, bottom: 64, left: 72 };
  const iw = width - margin.left - margin.right;
  const ih = height - margin.top - margin.bottom;

  let vars = [xVar, yVar];
  if (sizeByPop) vars = [...vars, "population"];
  const filtered = validForAll(data, vars);

  const xScale = d3.scaleLinear()
    .domain(d3.extent(filtered, (d) => d[xVar])).nice()
    .range([0, iw]);
  const yScale = d3.scaleLinear()
    .domain(d3.extent(filtered, (d) => d[yVar])).nice()
    .range([ih, 0]);
  const rScale = sizeByPop
    ? d3.scaleSqrt().domain([0, d3.max(filtered, (d) => d.population)]).range([2, 18])
    : null;

  const svg = d3.create("svg")
    .attr("width", width).attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("max-width", "100%").style("height", "auto");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Grid lines
  g.append("g").attr("class", "grid")
    .call(d3.axisLeft(yScale).ticks(5).tickSize(-iw).tickFormat(""))
    .selectAll("line").attr("stroke", "#eee");
  g.select(".grid .domain").remove();

  g.append("g").attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format(".2s")));
  g.append("g").call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format(".2s")));

  // Axis labels
  g.append("text").attr("class", "chart-x-label")
    .attr("x", iw / 2).attr("y", ih + 48)
    .attr("text-anchor", "middle")
    .text(NUMERIC_LABELS[xVar] || xVar);

  g.append("text").attr("class", "chart-y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -ih / 2).attr("y", -54)
    .attr("text-anchor", "middle")
    .text(NUMERIC_LABELS[yVar] || yVar);

  const tooltip = getTooltip();

  g.selectAll("circle.dot")
    .data(filtered)
    .join("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(d[xVar]))
    .attr("cy", (d) => yScale(d[yVar]))
    .attr("r", (d) => sizeByPop ? rScale(d.population) : 5)
    .attr("fill", (d) => colorByRegion ? regionColor(d.region) : "#4e79a7")
    .attr("opacity", 0.7)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .on("mouseover", (event, d) => {
      tooltip.style.display = "block";
      let html = `<strong>${d.country}</strong><br>`;
      html += `${NUMERIC_LABELS[xVar] || xVar}: ${d3.format(",.1f")(d[xVar])}<br>`;
      html += `${NUMERIC_LABELS[yVar] || yVar}: ${d3.format(",.1f")(d[yVar])}`;
      if (colorByRegion) html += `<br>Region: ${d.region}`;
      if (sizeByPop) html += `<br>Population: ${d3.format(",.0f")(d.population)}`;
      tooltip.innerHTML = html;
    })
    .on("mousemove", (event) => {
      tooltip.style.left = `${event.clientX + 14}px`;
      tooltip.style.top = `${event.clientY - 36}px`;
    })
    .on("mouseout", () => { tooltip.style.display = "none"; });

  // Region legend
  if (colorByRegion) {
    const lx = margin.left + iw + 12;
    const lg = svg.append("g").attr("transform", `translate(${lx}, ${margin.top})`);
    REGIONS.forEach((r, i) => {
      lg.append("circle").attr("cx", 6).attr("cy", i * 20 + 6).attr("r", 6)
        .attr("fill", regionColor(r)).attr("opacity", 0.8);
      lg.append("text").attr("x", 16).attr("y", i * 20 + 10)
        .style("font-size", "11px").text(r);
    });
  }

  return svg.node();
}
