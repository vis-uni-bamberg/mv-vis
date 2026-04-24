export const NUMERIC_VARS = [
  "population",
  "income",
  "health_expenditure",
  "life_expectancy",
  "babies_per_woman",
];

export const NUMERIC_LABELS = {
  population:         "Population",
  income:             "Income (GDP/citizen, int$)",
  health_expenditure: "Health Expenditure (USD/citizen)",
  life_expectancy:    "Life Expectancy (years)",
  babies_per_woman:   "Babies per Woman",
};

// FileAttachment must be passed in from the .md cell (cannot be created inside a module)
export async function loadWorld(attachment) {
  const raw = await attachment.csv({ typed: true });
  return raw.map((d) => {
    const row = { ...d };
    for (const col of NUMERIC_VARS) {
      const v = row[col];
      if (v === null || v === undefined || v === "NA" || (typeof v === "number" && isNaN(v))) {
        row[col] = null;
      }
    }
    return row;
  });
}

export function validFor(data, variable) {
  return data.filter((d) => d[variable] !== null && d[variable] !== undefined);
}

export function validForAll(data, variables) {
  return data.filter((d) => variables.every((v) => d[v] !== null && d[v] !== undefined));
}
