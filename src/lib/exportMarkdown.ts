import { ARCHETYPES, FACT_FIELDS, UA_TOKENS, type WorkbookState } from "./types";

function countConfident(card: WorkbookState["lab2"]["brooklinen"]) {
  return FACT_FIELDS.filter(({ key }) => card.fields[key].status === "confident")
    .length;
}

export function exportMarkdown(state: WorkbookState): string {
  const { meta, lab1, lab2, lab3, lab3Closest, lab4, lab5, lab6, capstone } =
    state;

  const lines: string[] = [
    `# The Second Audience - Student Workbook`,
    ``,
    `Name: ${meta.name || "_"}`,
    `Cohort: ${meta.cohort || "_"}`,
    `Date: ${meta.date || "_"}`,
    ``,
    `> Where measurement is narrower than the phenomenon, the thesis wins.`,
    ``,
    `## Lab 1 - Classify the traffic`,
    ``,
    ...UA_TOKENS.map(
      (token, i) => `${i + 1}. \`${token}\` → **${lab1.roles[token] || "_"}**`,
    ),
    ``,
    `**Checkpoint 1:** ${lab1.checkpoint1 || "_"}`,
    ``,
    `**Checkpoint 2:** ${lab1.checkpoint2 || "_"}`,
    ``,
    `## Lab 2 - Recovery cards`,
    ``,
  ];

  (
    [
      ["Brooklinen", lab2.brooklinen],
      ["Bombas", lab2.bombas],
      ["Unbound Merino", lab2.unbound],
    ] as const
  ).forEach(([name, card]) => {
    lines.push(
      `### ${name}`,
      ``,
      `Confident: **${countConfident(card)} / 6** · Blocked: ${card.blocked || "_"} · Agent: ${card.agent || "_"}`,
      ``,
      ...FACT_FIELDS.map(
        ({ key, label }) =>
          `- ${label}: **${card.fields[key].status || "_"}** - ${card.fields[key].notes || ""}`,
      ),
      ``,
      `Can establish: ${card.canEstablish || "_"}`,
      ``,
      `Cannot establish: ${card.cannotEstablish || "_"}`,
      ``,
      `Claim: ${card.claim || "_"}`,
      ``,
      `Summary: ${card.summary || "_"}`,
      ``,
    );
  });

  lines.push(
    `## Lab 3 - Archetypes`,
    ``,
    ...ARCHETYPES.map(
      (a) => `- ${a.label} (${a.example}): ${lab3[a.key] || "_"}`,
    ),
    ``,
    `Closest to my brand: ${lab3Closest || "_"}`,
    ``,
    `## Lab 4 - Surfaces / landscape`,
    ``,
    ...Object.entries(lab4.surfaces).map(
      ([k, v]) => `- [${v ? "x" : " "}] ${k}`,
    ),
    lab4.other ? `- other: ${lab4.other}` : "",
    ``,
    `| Domain | Edge | Challenge | Day-0 possible? |`,
    `|---|---|---|---|`,
    ...lab4.rows.map(
      (r) =>
        `| ${r.domain || " "} | ${r.edge || " "} | ${r.challenge || " "} | ${r.day0 || " "} |`,
    ),
    ``,
    `## Lab 5 - Consumability draft`,
    ``,
    "```",
    lab5.draft || "",
    "```",
    ``,
    `Byte count (approx): ${new TextEncoder().encode(lab5.draft).length}`,
    ``,
    ...Object.entries(lab5.improves).map(
      ([k, v]) => `- [${v ? "x" : " "}] ${k}`,
    ),
    ``,
    `Not tested: ${lab5.notTested || "_"}`,
    ``,
    `## Lab 6 - One-variable experiment`,
    ``,
    `Hypothesis: ${lab6.hypothesis || "_"}`,
    ``,
    `Variable: ${lab6.variable || "_"}`,
    ``,
    ...Object.entries(lab6.stages).map(
      ([k, v]) => `- [${v ? "x" : " "}] ${k}`,
    ),
    ``,
    `Will score: ${lab6.score || "_"}`,
    ``,
    `Will not claim: ${lab6.notClaim || "_"}`,
    ``,
    `Runs: ${lab6.runs || "_"}`,
    ``,
    `Labels: ${lab6.labels || "_"}`,
    ``,
    `## Capstone`,
    ``,
    `Brand / URL: ${capstone.brand || "_"}`,
    ``,
    `Claim: ${capstone.claim || "_"}`,
    ``,
    ...Object.entries(capstone.layers).map(
      ([k, v]) => `- [${v ? "x" : " "}] ${k}`,
    ),
    ``,
    `Instrumentation note: ${capstone.observeNote || "_"}`,
    ``,
    `Recovery: ${capstone.recovery || "_"}`,
    ``,
    `Experiment: ${capstone.experiment || "_"}`,
    ``,
    `Epistemic close: ${capstone.epistemic || "_"}`,
    ``,
    `---`,
    ``,
    `Exported from the Second Audience workbook.`,
    `https://audiencetwo.com/second-audience`,
  );

  return lines.filter((l) => l !== undefined).join("\n");
}
