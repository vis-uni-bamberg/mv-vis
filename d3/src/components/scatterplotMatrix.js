import * as d3 from "npm:d3";
import { NUMERIC_VARS, NUMERIC_LABELS, validFor, validForAll } from "./dataLoader.js";
import { regionColor } from "./colors.js";

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

function pearsonR(xs, ys) {
  const n = xs.length;
  if (n < 2) return NaN;
  const mx = d3.mean(xs), my = d3.mean(ys);
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const ex = xs[i] - mx, ey = ys[i] - my;
    num += ex * ey; dx2 += ex * ex; dy2 += ey * ey;
  }
  return num / Math.sqrt(dx2 * dy2);
}

/**
 * scatterplotMatrix(data, options) → SVGElement
 *
 * options:
 *   variables      – array of column names (default: all 5 NUMERIC_VARS)
 *   colorByRegion  – color dots by region (default: false)
 *   cellSize       – pixels per cell (default: 130)
 */
function isDark() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export function scatterplotMatrix(data, {
  variables = NUMERIC_VARS,
  colorByRegion = false,
  cellSize = 130,
} = {}) {
  const n = variables.length;
  const pad = 2;
  const labelH = 30;
  const totalSize = n * cellSize;
  const width = totalSize + labelH * 2;
  const height = totalSize + labelH * 2;

  // Pre-compute per-variable extents and scales
  const extents = {};
  const scales = {};
  variables.forEach((v) => {
    const vals = validFor(data, v).map((d) => d[v]);
    extents[v] = d3.extent(vals);
    scales[v] = d3.scaleLinear().domain(extents[v]).nice().range([pad, cellSize - pad]);
  });

  const svg = d3.create("svg")
    .attr("width", width).attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("max-width", "100%").style("height", "auto");

  const root = svg.append("g").attr("transform", `translate(${labelH},${labelH})`);
  const tooltip = getTooltip();

  variables.forEach((rowVar, row) => {
    variables.forEach((colVar, col) => {
      const cx = col * cellSize;
      const cy = row * cellSize;
      const cell = root.append("g")
        .attr("class", `cell r${row}c${col}`)
        .attr("transform", `translate(${cx},${cy})`);

      // Cell background
      const dark = isDark();
      cell.append("rect")
        .attr("width", cellSize).attr("height", cellSize)
        .attr("fill", row === col
          ? (dark ? "#1a2433" : "#f0f4f8")
          : (dark ? "#111820" : "#fafafa"))
        .attr("stroke", dark ? "#2a3a4a" : "#ddd").attr("stroke-width", 0.5);

      if (row === col) {
        // Diagonal: histogram of this variable
        const valid = validFor(data, rowVar);
        const vals = valid.map((d) => d[rowVar]);
        const xSc = d3.scaleLinear().domain(extents[rowVar]).nice().range([pad, cellSize - pad]);
        const binner = d3.bin().value((d) => d[rowVar]).domain(xSc.domain()).thresholds(10);
        const bins = binner(valid);
        const yMax = d3.max(bins, (b) => b.length);
        const ySc = d3.scaleLinear().domain([0, yMax]).range([cellSize - pad, pad]);

        cell.selectAll("rect.diag-bin")
          .data(bins)
          .join("rect")
          .attr("class", "diag-bin")
          .attr("x", (b) => xSc(b.x0))
          .attr("y", (b) => ySc(b.length))
          .attr("width", (b) => Math.max(0, xSc(b.x1) - xSc(b.x0) - 0.5))
          .attr("height", (b) => (cellSize - pad) - ySc(b.length))
          .attr("fill", "#4e79a7").attr("opacity", 0.7);

      } else if (row > col) {
        // Below diagonal: scatterplot
        const xVar = colVar, yVar = rowVar;
        const valid = validForAll(data, [xVar, yVar]);
        const xSc = d3.scaleLinear().domain(extents[xVar]).nice().range([pad, cellSize - pad]);
        const ySc = d3.scaleLinear().domain(extents[yVar]).nice().range([cellSize - pad, pad]);

        cell.selectAll("circle.dot")
          .data(valid)
          .join("circle")
          .attr("class", "dot")
          .attr("cx", (d) => xSc(d[xVar]))
          .attr("cy", (d) => ySc(d[yVar]))
          .attr("r", 2.5)
          .attr("fill", (d) => colorByRegion ? regionColor(d.region) : "#4e79a7")
          .attr("opacity", 0.55)
          .on("mouseover", (event, d) => {
            tooltip.style.display = "block";
            tooltip.innerHTML = `<strong>${d.country}</strong><br>` +
              `${NUMERIC_LABELS[xVar]}: ${d3.format(",.1f")(d[xVar])}<br>` +
              `${NUMERIC_LABELS[yVar]}: ${d3.format(",.1f")(d[yVar])}`;
          })
          .on("mousemove", (event) => {
            tooltip.style.left = `${event.clientX + 14}px`;
            tooltip.style.top = `${event.clientY - 36}px`;
          })
          .on("mouseout", () => { tooltip.style.display = "none"; });

      } else {
        // Above diagonal: Pearson r
        const valid = validForAll(data, [colVar, rowVar]);
        const r = pearsonR(valid.map((d) => d[colVar]), valid.map((d) => d[rowVar]));
        const absR = Math.abs(r);
        const rColor = r > 0
          ? d3.interpolateBlues(0.3 + absR * 0.65)
          : d3.interpolateReds(0.3 + absR * 0.65);

        cell.append("text")
          .attr("x", cellSize / 2).attr("y", cellSize / 2 + 5)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-size", `${10 + absR * 8}px`)
          .style("font-weight", absR > 0.6 ? "bold" : "normal")
          .attr("fill", rColor)
          .text(isNaN(r) ? "—" : d3.format(".2f")(r));
      }

      // Axis ticks on outer edges only
      if (row === n - 1) {
        // Bottom row: x-axis ticks
        const xSc = d3.scaleLinear().domain(extents[colVar]).nice().range([pad, cellSize - pad]);
        cell.append("g")
          .attr("transform", `translate(0,${cellSize})`)
          .call(d3.axisBottom(xSc).ticks(3).tickSize(3).tickFormat(d3.format(".2s")))
          .selectAll("text").style("font-size", "8px");
        cell.select(".domain").remove();
      }
      if (col === 0) {
        // Left column: y-axis ticks
        const ySc = d3.scaleLinear()
          .domain(row === col ? [0, 1] : extents[rowVar]).nice()
          .range([cellSize - pad, pad]);
        cell.append("g")
          .call(d3.axisLeft(ySc).ticks(3).tickSize(3).tickFormat(d3.format(".2s")))
          .selectAll("text").style("font-size", "8px");
        cell.select(".domain").remove();
      }
    });

    // Variable labels on diagonal
    const diagCell = root.select(`.r${row}c${row}`);
    diagCell.append("text")
      .attr("x", cellSize / 2).attr("y", 14)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .attr("fill", "currentColor")
      .text(NUMERIC_LABELS[variables[row]] || variables[row]);
  });


  return svg.node();
}
