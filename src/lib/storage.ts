import {
  ARCHETYPES,
  FACT_FIELDS,
  MEDIATION_LAYERS,
  SURFACES,
  UA_TOKENS,
  type RecoveryCard,
  type WorkbookState,
} from "./types";

function emptyCard(product = ""): RecoveryCard {
  return {
    product,
    agent: "",
    date: "",
    blocked: "",
    statusCode: "",
    fields: Object.fromEntries(
      FACT_FIELDS.map(({ key }) => [key, { status: "", notes: "" }]),
    ) as RecoveryCard["fields"],
    canEstablish: "",
    cannotEstablish: "",
    claim: "",
    summary: "",
    extra: "",
  };
}

export function createInitialState(): WorkbookState {
  return {
    meta: { name: "", cohort: "", date: "" },
    lab1: {
      roles: Object.fromEntries(UA_TOKENS.map((t) => [t, ""])),
      checkpoint1: "",
      checkpoint2: "",
    },
    lab2: {
      brooklinen: emptyCard("Brooklinen"),
      bombas: emptyCard("Bombas"),
      unbound: emptyCard("Unbound Merino"),
    },
    lab3: Object.fromEntries(ARCHETYPES.map((a) => [a.key, ""])),
    lab3Closest: "",
    lab4: {
      surfaces: Object.fromEntries(SURFACES.map((s) => [s, false])),
      other: "",
      rows: Array.from({ length: 5 }, () => ({
        domain: "",
        edge: "",
        challenge: "",
        day0: "",
      })),
    },
    lab5: {
      draft: "",
      improves: {
        "fact recovery": false,
        "factual accuracy": false,
        "token efficiency": false,
        "none of these": false,
      },
      notTested: "",
    },
    lab6: {
      hypothesis: "",
      variable: "",
      stages: {
        access: false,
        representation: false,
        extraction: false,
        answer: false,
        referral: false,
        transaction: false,
      },
      score: "",
      notClaim: "",
      runs: "",
      labels: "",
    },
    capstone: {
      brand: "",
      claim: "",
      layers: Object.fromEntries(MEDIATION_LAYERS.map((l) => [l, false])),
      observeNote: "",
      recovery: "",
      experiment: "",
      epistemic: "",
    },
  };
}

export const STORAGE_KEY = "second-audience-workbook-v1";

export function loadState(): WorkbookState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    return { ...createInitialState(), ...JSON.parse(raw) } as WorkbookState;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: WorkbookState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
