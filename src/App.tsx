import { useMemo } from "react";
import { exportMarkdown } from "./lib/exportMarkdown";
import { useWorkbook } from "./lib/useWorkbook";
import {
  ARCHETYPES,
  FACT_FIELDS,
  MEDIATION_LAYERS,
  SURFACES,
  UA_TOKENS,
  type FactField,
  type FactStatus,
  type RecoveryCard,
  type TrafficRole,
  type WorkbookState,
} from "./lib/types";

const STATUSES: FactStatus[] = ["confident", "wrong", "ambiguous", "absent"];
const ROLES: TrafficRole[] = ["reader", "answer", "training", "search"];

function confidentCount(card: RecoveryCard) {
  return FACT_FIELDS.filter(({ key }) => card.fields[key].status === "confident")
    .length;
}

function downloadMarkdown(state: WorkbookState) {
  const md = exportMarkdown(state);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "second-audience-workbook.md";
  a.click();
  URL.revokeObjectURL(url);
}

function RecoveryEditor({
  title,
  sheetHref,
  card,
  onChange,
}: {
  title: string;
  sheetHref: string;
  card: RecoveryCard;
  onChange: (next: RecoveryCard) => void;
}) {
  const setField = (key: FactField, patch: Partial<RecoveryCard["fields"][FactField]>) => {
    onChange({
      ...card,
      fields: {
        ...card.fields,
        [key]: { ...card.fields[key], ...patch },
      },
    });
  };

  return (
    <div className="card">
      <div className="card-top">
        <strong>
          {title}{" "}
          <a href={sheetHref} target="_blank" rel="noreferrer">
            open sheet
          </a>
        </strong>
        <span className="score-chip">
          {confidentCount(card)} <span>/ 6 confident</span>
        </span>
      </div>
      <div className="card-top">
        <label>
          agent{" "}
          <input
            value={card.agent}
            onChange={(e) => onChange({ ...card, agent: e.target.value })}
            placeholder="ChatGPT-User"
          />
        </label>
        <label>
          date{" "}
          <input
            value={card.date}
            onChange={(e) => onChange({ ...card, date: e.target.value })}
            placeholder="YYYY-MM-DD"
          />
        </label>
        <label>
          blocked{" "}
          <select
            value={card.blocked}
            onChange={(e) =>
              onChange({
                ...card,
                blocked: e.target.value as RecoveryCard["blocked"],
              })
            }
          >
            <option value="">?</option>
            <option value="Y">Y</option>
            <option value="N">N</option>
          </select>
        </label>
      </div>

      <div className="fact-grid">
        {FACT_FIELDS.map(({ key, label }) => (
          <div className="fact-row" key={key}>
            <div className="name">{label}</div>
            <div>
              <div className="status-pills">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${card.fields[key].status === s ? `on ${s}` : ""}`}
                    onClick={() => setField(key, { status: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                className="line"
                value={card.fields[key].notes}
                onChange={(e) => setField(key, { notes: e.target.value })}
                placeholder="what you saw"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="field-label">What this score can establish</div>
      <input
        className="line"
        value={card.canEstablish}
        onChange={(e) => onChange({ ...card, canEstablish: e.target.value })}
      />
      <div className="field-label">What this score cannot establish</div>
      <input
        className="line"
        value={card.cannotEstablish}
        onChange={(e) => onChange({ ...card, cannotEstablish: e.target.value })}
      />
      <div className="field-label">Claim label</div>
      <select
        className="line"
        value={card.claim}
        onChange={(e) =>
          onChange({
            ...card,
            claim: e.target.value as RecoveryCard["claim"],
          })
        }
      >
        <option value="">select</option>
        <option>Observed</option>
        <option>Supported</option>
        <option>Unknown</option>
        <option>Speculation</option>
      </select>
      <div className="field-label">Summary (3 lines max)</div>
      <textarea
        className="area"
        value={card.summary}
        onChange={(e) => onChange({ ...card, summary: e.target.value })}
      />
    </div>
  );
}

export default function App() {
  const { state, patch, reset, hydrated } = useWorkbook();

  const progress = useMemo(() => {
    const classified = UA_TOKENS.filter((t) => state.lab1.roles[t]).length;
    const scored = [
      state.lab2.brooklinen,
      state.lab2.bombas,
      state.lab2.unbound,
    ].filter((c) => FACT_FIELDS.some(({ key }) => c.fields[key].status)).length;
    return { classified, scored };
  }, [state]);

  if (!hydrated) {
    return <div className="app" />;
  }

  return (
    <>
      <div className="toolbar">
        <span
          style={{
            marginRight: "auto",
            color: "#a8a599",
            fontSize: 11,
            letterSpacing: "0.08em",
            alignSelf: "center",
          }}
        >
          AUTOSAVED · {progress.classified}/10 roles · {progress.scored}/3 cards
        </span>
        <a
          className="tool"
          href="https://audiencetwo.com/second-audience"
          target="_blank"
          rel="noreferrer"
        >
          Course
        </a>
        <a
          className="tool"
          href="https://audiencetwo.com/second-audience/thesis"
          target="_blank"
          rel="noreferrer"
        >
          Thesis
        </a>
        <button type="button" onClick={() => window.print()}>
          Print
        </button>
        <button type="button" onClick={() => reset()}>
          Reset
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => downloadMarkdown(state)}
        >
          Export .md
        </button>
      </div>

      <div className="app">
        <div className="sheet">
          <header className="masthead">
            <div>
              <div className="kicker">THE SECOND AUDIENCE · FIELD COURSE</div>
              <h1>Student Workbook</h1>
            </div>
            <div className="meta">
              <label>
                NAME
                <input
                  value={state.meta.name}
                  onChange={(e) =>
                    patch((s) => ({
                      ...s,
                      meta: { ...s.meta, name: e.target.value },
                    }))
                  }
                />
              </label>
              <label>
                COHORT
                <input
                  value={state.meta.cohort}
                  onChange={(e) =>
                    patch((s) => ({
                      ...s,
                      meta: { ...s.meta, cohort: e.target.value },
                    }))
                  }
                />
              </label>
              <label>
                DATE
                <input
                  value={state.meta.date}
                  onChange={(e) =>
                    patch((s) => ({
                      ...s,
                      meta: { ...s.meta, date: e.target.value },
                    }))
                  }
                />
              </label>
            </div>
          </header>

          <nav className="nav">
            <a href="#measures">Measures</a>
            <a href="#taxonomies">Taxonomies</a>
            <a href="#claims">Claims</a>
            <a href="#lab1">Lab 1</a>
            <a href="#lab2">Lab 2</a>
            <a href="#lab3">Lab 3</a>
            <a href="#lab4">Lab 4</a>
            <a href="#lab5">Lab 5</a>
            <a href="#lab6">Lab 6</a>
            <a href="#capstone">Capstone</a>
          </nav>

          <section className="callout" id="measures">
            <div className="label">WHAT THIS WORKBOOK MEASURES</div>
            <p>
              The Second Audience is larger than the surfaces we can directly
              measure in these labs. It includes machine systems involved in
              training, indexing, retrieval, answering, recommendation, agentic
              action, and transactions.
            </p>
            <p>
              This workbook concentrates on the parts we can inspect most
              directly today: machine requests, live-reader representations,
              commercial fact recovery, referrals, and controlled experiments.
            </p>
            <p style={{ fontWeight: 600 }}>
              Do not confuse what we can measure with the full phenomenon.
            </p>
          </section>

          <section className="section" id="taxonomies">
            <div className="section-head">
              <span className="section-mark">§0</span>
              <h2>Two taxonomies are used in this course</h2>
            </div>
            <div className="grid-2">
              <div className="panel">
                <div className="title">MACHINE-MEDIATION ROLES</div>
                <div className="body">
                  Training → Indexing → Retrieval → Answering → Decision →
                  Agentic → Transactional
                </div>
                <div className="note">
                  The conceptual taxonomy from the thesis.
                </div>
              </div>
              <div className="panel">
                <div className="title">HTTP TRAFFIC ROLES</div>
                <div className="body">
                  Live reader → Answer indexing → Training → Search
                </div>
                <div className="note">
                  The operational taxonomy for classifying identifiable requests
                  in logs.
                </div>
              </div>
            </div>
            <p className="warn">
              Do not treat the HTTP taxonomy as the complete Second Audience.
              There are four categories in this measurement surface, not four
              categories in the phenomenon.
            </p>
          </section>

          <section className="section" id="claims">
            <div className="section-head">
              <span className="section-mark">§1</span>
              <h2>How to label claims</h2>
            </div>
            <p className="lede">
              Every line you write in this workbook carries one of four labels.
              Use the course shorthand; know how it maps to the public research
              vocabulary.
            </p>
            <div className="table">
              <div className="table-head">
                <div>SHORTHAND</div>
                <div>MEANS</div>
              </div>
              <div className="table-row">
                <div className="key accent">Observed</div>
                <div className="val">
                  Experimentally observed under stated conditions.
                </div>
              </div>
              <div className="table-row">
                <div className="key">Supported</div>
                <div className="val">
                  Repeated evidence supports the claim, but it is not
                  established as universal.
                </div>
              </div>
              <div className="table-row">
                <div className="key">Unknown</div>
                <div className="val">Insufficient evidence.</div>
              </div>
              <div className="table-row">
                <div className="key">Speculation</div>
                <div className="val">
                  An explicitly labeled possibility or hypothesis.
                </div>
              </div>
            </div>
            <p className="lede" style={{ marginTop: 14 }}>
              Constitutional rule: where measurement is narrower than the
              phenomenon, the thesis wins.{" "}
              <span style={{ color: "var(--warn)", fontWeight: 500 }}>
                “Supported” is not the same as “Documented.”
              </span>
            </p>
          </section>

          <section className="section">
            <div className="section-head">
              <span className="section-mark">§2</span>
              <h2>Commercial fact recovery score</h2>
            </div>
            <div className="hero-metric">
              <div>
                <div className="label">HERO METRIC</div>
                <p>
                  Wrong facts in an extract are worse than missing facts. Score
                  confidence, not keyword vibes.
                </p>
                <p className="dim">
                  A recovery score measures{" "}
                  <strong style={{ color: "#efe9d7" }}>
                    consumability after access
                  </strong>
                  . It does not measure discoverability or recommendation
                  probability.
                </p>
              </div>
              <div className="hero-score">
                <div className="n">
                  N <span>/ 6</span>
                </div>
                <div className="cap">CONFIDENT FACTS</div>
                <div className="fields">
                  price · availability · shipping · returns · size/fit · offer
                </div>
              </div>
            </div>
          </section>

          <div className="labs-divider">
            <div className="label">THE LABS</div>
            <p className="warn sm">
              Every lab teaches a measurable thing while naming the larger thing
              it does not measure.
            </p>
          </div>

          <section className="lab" id="lab1">
            <div className="lab-head">
              <span className="lab-tag">LAB 1</span>
              <h3>Who is on the machine side?</h3>
            </div>
            <p className="lede">
              Classify each token. One HTTP traffic role only. Same vendor can
              mean different economics.
            </p>
            <div className="ua-grid">
              {UA_TOKENS.map((token, i) => (
                <div className="ua-row" key={token}>
                  <span style={{ color: "var(--mute)" }}>{i + 1}</span>
                  <code>{token}</code>
                  <select
                    value={state.lab1.roles[token]}
                    onChange={(e) =>
                      patch((s) => ({
                        ...s,
                        lab1: {
                          ...s.lab1,
                          roles: {
                            ...s.lab1.roles,
                            [token]: e.target.value as TrafficRole,
                          },
                        },
                      }))
                    }
                  >
                    <option value="">role…</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="field-label">CHECKPOINT</div>
            <p className="lede">
              1 · Why does rolling all OpenAI traffic into one number destroy
              useful signal?
            </p>
            <textarea
              className="area"
              value={state.lab1.checkpoint1}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  lab1: { ...s.lab1, checkpoint1: e.target.value },
                }))
              }
            />
            <p className="lede" style={{ marginTop: 14 }}>
              2 · Why does correctly classifying an HTTP request still not tell
              you where that event sits in the full machine-mediation pipeline?
            </p>
            <textarea
              className="area"
              value={state.lab1.checkpoint2}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  lab1: { ...s.lab1, checkpoint2: e.target.value },
                }))
              }
            />
          </section>

          <section className="lab" id="lab2">
            <div className="lab-head">
              <span className="lab-tag">LAB 2</span>
              <h3>Score recovery cards</h3>
            </div>
            <p className="lede">
              Open the public sheets. Fill one card each. Model answer for
              Brooklinen: <em>Can</em> establish what facts survived in this
              tested representation. <em>Cannot</em> establish whether ChatGPT
              is more likely to retrieve or recommend Brooklinen.
            </p>
            <RecoveryEditor
              title="A · Brooklinen"
              sheetHref="https://observe.audiencetwo.com/brooklinen"
              card={state.lab2.brooklinen}
              onChange={(card) =>
                patch((s) => ({
                  ...s,
                  lab2: { ...s.lab2, brooklinen: card },
                }))
              }
            />
            <RecoveryEditor
              title="B · Bombas"
              sheetHref="https://observe.audiencetwo.com/bombas"
              card={state.lab2.bombas}
              onChange={(card) =>
                patch((s) => ({
                  ...s,
                  lab2: { ...s.lab2, bombas: card },
                }))
              }
            />
            <RecoveryEditor
              title="C · Unbound Merino"
              sheetHref="https://observe.audiencetwo.com/unboundmerino"
              card={state.lab2.unbound}
              onChange={(card) =>
                patch((s) => ({
                  ...s,
                  lab2: { ...s.lab2, unbound: card },
                }))
              }
            />
          </section>

          <section className="lab" id="lab3">
            <div className="lab-head">
              <span className="lab-tag">LAB 3</span>
              <h3>Sort the gaps / archetype notes</h3>
            </div>
            <p className="lede">
              Group observations into gap types, then jot one line per archetype
              while watching the walkthroughs.
            </p>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="panel">
                <div className="title">LEGIBILITY GAP</div>
                <div className="body">
                  Facts that should be available aren’t.
                </div>
              </div>
              <div className="panel">
                <div className="title">COMMERCIAL COMPLETENESS GAP</div>
                <div className="body">
                  Core facts work, but offer / merchandising information is
                  absent.
                </div>
              </div>
            </div>
            {ARCHETYPES.map((a) => (
              <div key={a.key} style={{ marginBottom: 12 }}>
                <div className="field-label">
                  {a.label} · {a.example}
                </div>
                <input
                  className="line"
                  value={state.lab3[a.key]}
                  onChange={(e) =>
                    patch((s) => ({
                      ...s,
                      lab3: { ...s.lab3, [a.key]: e.target.value },
                    }))
                  }
                  placeholder="what failed or worked"
                />
              </div>
            ))}
            <div className="field-label">
              Which archetype is closest to a brand you care about? Why?
            </div>
            <textarea
              className="area"
              value={state.lab3Closest}
              onChange={(e) =>
                patch((s) => ({ ...s, lab3Closest: e.target.value }))
              }
            />
          </section>

          <section className="lab" id="lab4">
            <div className="lab-head">
              <span className="lab-tag">LAB 4</span>
              <h3>Standards check + landscape</h3>
            </div>
            <p className="lede">
              Record which machine-facing surfaces are observable. Presence
              only.
            </p>
            <div className="checks">
              {SURFACES.map((s) => (
                <label key={s}>
                  <input
                    type="checkbox"
                    checked={state.lab4.surfaces[s]}
                    onChange={(e) =>
                      patch((prev) => ({
                        ...prev,
                        lab4: {
                          ...prev.lab4,
                          surfaces: {
                            ...prev.lab4.surfaces,
                            [s]: e.target.checked,
                          },
                        },
                      }))
                    }
                  />
                  {s}
                </label>
              ))}
              <label>
                other
                <input
                  className="line"
                  style={{ width: 90, marginLeft: 8 }}
                  value={state.lab4.other}
                  onChange={(e) =>
                    patch((prev) => ({
                      ...prev,
                      lab4: { ...prev.lab4, other: e.target.value },
                    }))
                  }
                />
              </label>
            </div>
            <p className="warn sm">
              Do not score presence as effectiveness. Presence proves a surface
              exists. It does not prove greater retrieval, recommendation, or
              conversion.
            </p>
            <div className="field-label" style={{ marginTop: 18 }}>
              Five domains (from Landscape export if you have it)
            </div>
            {state.lab4.rows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {(
                  [
                    ["domain", "domain"],
                    ["edge", "edge / CDN"],
                    ["challenge", "challenge?"],
                    ["day0", "day-0 possible?"],
                  ] as const
                ).map(([key, ph]) => (
                  <input
                    key={key}
                    className="line"
                    placeholder={ph}
                    value={row[key]}
                    onChange={(e) =>
                      patch((prev) => {
                        const rows = [...prev.lab4.rows];
                        rows[i] = { ...rows[i], [key]: e.target.value };
                        return {
                          ...prev,
                          lab4: { ...prev.lab4, rows },
                        };
                      })
                    }
                  />
                ))}
              </div>
            ))}
          </section>

          <section className="lab" id="lab5">
            <div className="lab-head">
              <span className="lab-tag">LAB 5</span>
              <h3>Improve consumability</h3>
            </div>
            <p className="lede">
              Create a machine-readable representation designed to reduce
              ambiguity in an already-selected product page. Offer as fact, never
              as action target. Ordinary product-page voice.
            </p>
            <p className="warn sm">
              This lab does not test whether Markdown improves discovery.
              Markdown can improve the representation without proving a
              retrieval advantage.
            </p>
            <textarea
              className="area code"
              value={state.lab5.draft}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  lab5: { ...s.lab5, draft: e.target.value },
                }))
              }
              placeholder="# Product&#10;Price: …&#10;Sale code: …&#10;In stock: …&#10;Shipping: …&#10;Returns: …"
            />
            <div
              style={{
                fontSize: 12,
                color: "var(--mute)",
                margin: "8px 0 14px",
              }}
            >
              ~{new TextEncoder().encode(state.lab5.draft).length} bytes
              {new TextEncoder().encode(state.lab5.draft).length > 600
                ? " (over 600)"
                : " (target ≤600)"}
            </div>
            <div className="field-label">Would this treatment plausibly improve</div>
            <div className="checks">
              {Object.keys(state.lab5.improves).map((k) => (
                <label key={k}>
                  <input
                    type="checkbox"
                    checked={state.lab5.improves[k]}
                    onChange={(e) =>
                      patch((s) => ({
                        ...s,
                        lab5: {
                          ...s.lab5,
                          improves: {
                            ...s.lab5.improves,
                            [k]: e.target.checked,
                          },
                        },
                      }))
                    }
                  />
                  {k}
                </label>
              ))}
            </div>
            <div className="field-label">What outcome have you not tested?</div>
            <input
              className="line"
              value={state.lab5.notTested}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  lab5: { ...s.lab5, notTested: e.target.value },
                }))
              }
            />
          </section>

          <section className="lab" id="lab6">
            <div className="lab-head">
              <span className="lab-tag">LAB 6</span>
              <h3>Change one variable</h3>
            </div>
            <p className="lede">
              A controlled experiment. State your one variable, then name where
              in the pipeline you expect the causal effect, before you run it.
            </p>
            <div className="field-label">Hypothesis</div>
            <textarea
              className="area"
              value={state.lab6.hypothesis}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  lab6: { ...s.lab6, hypothesis: e.target.value },
                }))
              }
            />
            <div className="field-label">Variable changed</div>
            <input
              className="line"
              value={state.lab6.variable}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  lab6: { ...s.lab6, variable: e.target.value },
                }))
              }
            />
            <div className="field-label">Pipeline stage being tested</div>
            <div className="checks">
              {Object.keys(state.lab6.stages).map((k) => (
                <label key={k}>
                  <input
                    type="checkbox"
                    checked={state.lab6.stages[k]}
                    onChange={(e) =>
                      patch((s) => ({
                        ...s,
                        lab6: {
                          ...s.lab6,
                          stages: {
                            ...s.lab6.stages,
                            [k]: e.target.checked,
                          },
                        },
                      }))
                    }
                  />
                  {k}
                </label>
              ))}
            </div>
            <div className="field-label">What you will score after</div>
            <input
              className="line"
              value={state.lab6.score}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  lab6: { ...s.lab6, score: e.target.value },
                }))
              }
            />
            <div className="field-label">What you will not claim</div>
            <input
              className="line"
              value={state.lab6.notClaim}
              onChange={(e) =>
                patch((s) => ({
                  ...s,
                  lab6: { ...s.lab6, notClaim: e.target.value },
                }))
              }
            />
            <p className="lede" style={{ marginTop: 12 }}>
              Guards against experiments like{" "}
              <em>Treatment: Markdown → Outcome: more revenue.</em> There are
              six hidden causal jumps in there.
            </p>
          </section>

          <section className="capstone" id="capstone">
            <div className="section-head">
              <span className="section-mark">§C</span>
              <h2>Capstone</h2>
            </div>
            <div className="block">
              <span className="tag">BRAND / PDP URL</span>
              <input
                className="line"
                value={state.capstone.brand}
                onChange={(e) =>
                  patch((s) => ({
                    ...s,
                    capstone: { ...s.capstone, brand: e.target.value },
                  }))
                }
              />
            </div>
            <div className="block">
              <span className="tag">A · CLAIM</span> - what do you assert?
              <input
                className="line"
                value={state.capstone.claim}
                onChange={(e) =>
                  patch((s) => ({
                    ...s,
                    capstone: { ...s.capstone, claim: e.target.value },
                  }))
                }
              />
            </div>
            <div className="block">
              <span className="tag">
                B · WHERE IN THE MEDIATION LAYER ARE YOU OBSERVING?
              </span>
              <div className="checks" style={{ marginTop: 8 }}>
                {MEDIATION_LAYERS.map((l) => (
                  <label key={l}>
                    <input
                      type="checkbox"
                      checked={state.capstone.layers[l]}
                      onChange={(e) =>
                        patch((s) => ({
                          ...s,
                          capstone: {
                            ...s.capstone,
                            layers: {
                              ...s.capstone.layers,
                              [l]: e.target.checked,
                            },
                          },
                        }))
                      }
                    />
                    {l}
                  </label>
                ))}
              </div>
              <div className="lede">
                Which of these can your evidence actually observe? Which are
                outside your instrumentation?
              </div>
              <input
                className="line"
                value={state.capstone.observeNote}
                onChange={(e) =>
                  patch((s) => ({
                    ...s,
                    capstone: {
                      ...s.capstone,
                      observeNote: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="block">
              <span className="tag">C · RECOVERY</span> - score / 6
              <input
                className="line"
                value={state.capstone.recovery}
                onChange={(e) =>
                  patch((s) => ({
                    ...s,
                    capstone: { ...s.capstone, recovery: e.target.value },
                  }))
                }
              />
            </div>
            <div className="block">
              <span className="tag">D · EXPERIMENT</span> - one variable, one
              pipeline stage
              <input
                className="line"
                value={state.capstone.experiment}
                onChange={(e) =>
                  patch((s) => ({
                    ...s,
                    capstone: { ...s.capstone, experiment: e.target.value },
                  }))
                }
              />
            </div>
            <div className="block">
              <span className="tag">E · EPISTEMIC CLOSE</span> - Observed /
              Supported / Unknown / Speculation
              <textarea
                className="area"
                value={state.capstone.epistemic}
                onChange={(e) =>
                  patch((s) => ({
                    ...s,
                    capstone: { ...s.capstone, epistemic: e.target.value },
                  }))
                }
              />
            </div>
          </section>

          <section className="section ladder">
            <div className="section-head">
              <span className="section-mark">§L</span>
              <h2>Attribution confidence ladder</h2>
            </div>
            <p className="lede">
              Strongest evidence that a measurable commercial event followed an
              AI-mediated path, at top.
            </p>
            <ol>
              <li>
                <span className="n">1</span>
                <span>
                  Transaction tied to a distinctive AI-relayed code or
                  deterministic identifier.
                </span>
              </li>
              <li>
                <span className="n dim">2</span>
                <span>
                  Click-through from an identifiable AI response / referral into
                  the site.
                </span>
              </li>
              <li>
                <span className="n dim">3</span>
                <span>Live-reader retrieval of the PDP.</span>
              </li>
              <li>
                <span className="n faint">4</span>
                <span>
                  Branded search / direct traffic inferred to have been
                  AI-influenced.
                </span>
              </li>
            </ol>
            <p className="warn sm">
              These do not measure the same event. A live-reader fetch proves
              consultation, not recommendation or conversion.
            </p>
          </section>

          <section className="caution">
            <div className="label">THE PERMANENT CAUTION</div>
            <p>
              The machine pipeline is partially observable. Your server may see
              a crawler without your brand ever entering an answer. Your brand
              may enter an answer from indexed or cached information without
              receiving a live answer-time request.
            </p>
            <div className="lines">
              Retrieval does not prove influence.
              <br />
              Citation does not prove recommendation.
              <br />
              Recommendation does not prove conversion.
            </div>
            <p className="punch">
              Measure the event you can see. Label everything else.
            </p>
          </section>

          <section className="ending">
            <p>
              Here is the tooling. Here is the methodology. Here is the growing
              dataset. Here is what we’ve observed. Here is what remains
              unanswered.
            </p>
            <div className="cta">Go measure it yourself.</div>
            <div className="foot">
              THE EXPERIMENT CONTINUES · AUDIENCETWO.COM
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
