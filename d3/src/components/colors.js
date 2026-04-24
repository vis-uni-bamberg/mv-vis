import * as d3 from "npm:d3";

export const REGIONS = ["Africa", "Americas", "Asia", "Europe", "Oceania"];

export const regionColor = d3.scaleOrdinal()
  .domain(REGIONS)
  .range(d3.schemeTableau10);

export function colorFor(region) {
  return regionColor(region);
}
