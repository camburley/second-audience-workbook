export type ClaimLabel = "Observed" | "Supported" | "Unknown" | "Speculation";

export type TrafficRole = "reader" | "answer" | "training" | "search" | "";

export type FactStatus = "confident" | "wrong" | "ambiguous" | "absent" | "";

export type FactField =
  | "price"
  | "availability"
  | "shipping"
  | "returns"
  | "size"
  | "offer";

export type RecoveryCard = {
  product: string;
  agent: string;
  date: string;
  blocked: "" | "Y" | "N";
  statusCode: string;
  fields: Record<FactField, { status: FactStatus; notes: string }>;
  canEstablish: string;
  cannotEstablish: string;
  claim: ClaimLabel | "";
  summary: string;
  extra: string;
};

export type WorkbookState = {
  meta: { name: string; cohort: string; date: string };
  lab1: {
    roles: Record<string, TrafficRole>;
    checkpoint1: string;
    checkpoint2: string;
  };
  lab2: {
    brooklinen: RecoveryCard;
    bombas: RecoveryCard;
    unbound: RecoveryCard;
  };
  lab3: Record<string, string>;
  lab3Closest: string;
  lab4: {
    surfaces: Record<string, boolean>;
    other: string;
    rows: { domain: string; edge: string; challenge: string; day0: string }[];
  };
  lab5: {
    draft: string;
    improves: Record<string, boolean>;
    notTested: string;
  };
  lab6: {
    hypothesis: string;
    variable: string;
    stages: Record<string, boolean>;
    score: string;
    notClaim: string;
    runs: string;
    labels: string;
  };
  capstone: {
    brand: string;
    claim: string;
    layers: Record<string, boolean>;
    observeNote: string;
    recovery: string;
    experiment: string;
    epistemic: string;
  };
};

export const FACT_FIELDS: { key: FactField; label: string }[] = [
  { key: "price", label: "price" },
  { key: "availability", label: "availability" },
  { key: "shipping", label: "shipping" },
  { key: "returns", label: "returns" },
  { key: "size", label: "size/fit" },
  { key: "offer", label: "offer" },
];

export const UA_TOKENS = [
  "ChatGPT-User",
  "GPTBot",
  "OAI-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Googlebot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
] as const;

export const ARCHETYPES = [
  { key: "blocked", label: "Blocked", example: "Bombas / Helix" },
  { key: "unusable", label: "200 != usable", example: "Fellow" },
  { key: "wrong", label: "Wrong facts", example: "Ride1Up / Ekster / Misen" },
  { key: "repair", label: "Repair", example: "Brooklinen" },
  { key: "merchandising", label: "Merchandising", example: "Unbound Merino" },
  { key: "disagreement", label: "Reader disagreement", example: "Ten Thousand" },
] as const;

export const MEDIATION_LAYERS = [
  "Training",
  "Indexing",
  "Retrieval",
  "Answering",
  "Decision",
  "Agentic",
  "Transactional",
] as const;

export const SURFACES = [
  "robots.txt",
  "Markdown negotiation",
  "agents.md",
  "MCP",
  "UCP",
] as const;
