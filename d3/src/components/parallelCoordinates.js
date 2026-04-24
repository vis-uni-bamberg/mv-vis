import * as d3 from "npm:d3";
import { NUMERIC_VARS, NUMERIC_LABELS, validForAll } from "./dataLoader.js";
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
 * parallelCoordinates(data, options) → SVGElement
 *
 * options:
 *   variables      – array of numeric column names (default: all 5 NUMERIC_VARS)
 *   opacity        – line opacity (default: 0.2)
 *   colorByRegion  – color lines by region (default: false)
 *   width          – SVG width (default: 900)
 *   height         – SVG height (default: 440)
 */
export function parallelCoordinates(data, {
  variables = NUMERIC_VARS,
  opacity = 0.2,
  colorByRegion = false,
  width = 900,
  height = 440,
} = {}) {
  const margin = { top: 48, right: 40, bottom: 24, left: 40 };
  const iw = width - margin.left - margin.right;
  const ih = height - margin.top - margin.bottom;

  const filtered = validForAll(data, variables);

  // One y-scale per variable (unit-min-max: all map to [ih, 0])
  const yScales = {};
  variables.forEach((v) => {
    yScales[v] = d3.scaleLinear()
      .domain(d3.extent(filtered, (d) => d[v]))
      .nice()
      .range([ih, 0]);
  });

  // x-scale for axis positions
  const xScale = d3.scalePoint()
    .domain(variables)
    .range([0, iw])
    .padding(0.1);

  const lineGen = d3.line();

  const svg = d3.create("svg")
    .attr("width", width).attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("max-width", "100%").style("height", "auto");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = getTooltip();

  // Draw lines
  g.selectAll("path.country-line")
    .data(filtered)
    .join("path")
    .attr("class", "country-line")
    .attr("d", (d) => lineGen(variables.map((v) => [xScale(v), yScales[v](d[v])])))
    .attr("fill", "none")
    .attr("stroke", (d) => colorByRegion ? regionColor(d.region) : "#4e79a7")
    .attr("stroke-width", 1.2)
    .attr("stroke-opacity", opacity)
    .on("mouseover", function(event, d) {
      d3.select(this).raise()
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 2.5);
      tooltip.style.display = "block";
      let html = `<strong>${d.country}</strong> (${d.region})<br>`;
      variables.forEach((v) => {
        html += `${NUMERIC_LABELS[v] || v}: ${d3.format(",.1f")(d[v])}<br>`;
      });
      tooltip.innerHTML = html;
    })
    .on("mousemove", (event) => {
      tooltip.style.left = `${event.clientX + 14}px`;
      tooltip.style.top = `${event.clientY - 36}px`;
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("stroke-opacity", opacity)
        .attr("stroke-width", 1.2);
      tooltip.style.display = "none";
    });

  // Draw vertical axes
  variables.forEach((v) => {
    const ax = g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${xScale(v)},0)`);

    ax.call(d3.axisLeft(yScales[v]).ticks(5).tickFormat(d3.format(".2s")));

    // Variable label above axis
    ax.append("text")
      .attr("y", -24)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .attr("fill", "currentColor")
      .text(NUMERIC_LABELS[v] || v);
  });

  // Region legend
  if (colorByRegion) {
    const lg = svg.append("g")
      .attr("transform", `translate(${margin.left + iw - 90}, ${margin.top + ih + 4})`);
    REGIONS.forEach((r, i) => {
      lg.append("line")
        .attr("x1", i * 110).attr("x2", i * 110 + 16)
        .attr("y1", 6).attr("y2", 6)
        .attr("stroke", regionColor(r)).attr("stroke-width", 2.5);
      lg.append("text")
        .attr("x", i * 110 + 20).attr("y", 10)
        .attr("fill", "currentColor")
        .style("font-size", "10px").text(r);
    });
  }

  return svg.node();
}
