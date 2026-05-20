"use client";
import { useState, useEffect, useCallback } from "react";

const CRITERES = [
  "Rôle pertinent",
  "Contexte suffisant",
  "Instruction claire",
  "Format adapté",
  "Contraintes bien choisies",
];

type Besoin = {
  prenom: string; contexte: string; tache: string; contraintes: string; criteres: string;
};
type Prompt = {
  auteur: string; besoin_de: string; prompt_text: string; reponse_llm: string; suppositions: string;
};
type Evaluation = {
  evaluateur: string; auteur_prompt: string;
  note1: number; note2: number; note3: number; note4: number; note5: number;
  point_fort: string; amelioration: string;
};
type Chain = {
  besoin: Besoin;
  prompteur: string | null;
  prompt: Prompt | null;
  evaluateur: string | null;
  evaluation: Evaluation | null;
  moyenne_notes: string | null;
};

function NoteBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
      <span style={{ flex: 1, fontSize: "0.8rem", color: "var(--text-muted)" }}>{label}</span>
      <div style={{ display: "flex", gap: "3px" }}>
        {[1, 2, 3, 4, 5].map(n => (
          <div
            key={n}
            style={{
              width: 20, height: 20, borderRadius: 4, fontSize: "0.7rem",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
              background: n <= value ? "var(--accent)" : "var(--surface2)",
              color: n <= value ? "#fff" : "var(--border)",
              border: `1px solid ${n <= value ? "var(--accent)" : "var(--border)"}`,
            }}
          >{n}</div>
        ))}
      </div>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", width: 24, textAlign: "right" }}>
        {value}/5
      </span>
    </div>
  );
}

function ChainView({ chain }: { chain: Chain }) {
  const { besoin, prompteur, prompt, evaluateur, evaluation, moyenne_notes } = chain;
  const notes = evaluation
    ? [evaluation.note1, evaluation.note2, evaluation.note3, evaluation.note4, evaluation.note5]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* Besoin */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
          <span style={{
            background: "var(--accent-dim)", color: "var(--accent)", borderRadius: "50%",
            width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
          }}>1</span>
          <h2 style={{ fontSize: "1rem" }}>Besoin de <strong>{besoin.prenom}</strong></h2>
        </div>
        <dl style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "0.5rem 1rem", fontSize: "0.875rem" }}>
          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Contexte</dt>
          <dd style={{ whiteSpace: "pre-wrap" }}>{besoin.contexte}</dd>
          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Tâche</dt>
          <dd style={{ whiteSpace: "pre-wrap" }}>{besoin.tache}</dd>
          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Contraintes</dt>
          <dd style={{ whiteSpace: "pre-wrap" }}>{besoin.contraintes}</dd>
          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Critères succès</dt>
          <dd style={{ whiteSpace: "pre-wrap" }}>{besoin.criteres}</dd>
        </dl>
      </div>

      {/* Prompt */}
      {!prompt ? (
        <div className="card" style={{ opacity: 0.5 }}>
          <span className="text-muted" style={{ fontSize: "0.875rem" }}>
            ⏳ Prompt non encore soumis{prompteur ? ` par ${prompteur}` : ""}.
          </span>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <span style={{
              background: "var(--accent-dim)", color: "var(--accent)", borderRadius: "50%",
              width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
            }}>2</span>
            <h2 style={{ fontSize: "1rem" }}>Prompt rédigé par <strong>{prompt.auteur}</strong></h2>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Prompt</p>
            <pre style={{
              whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.85rem",
              background: "var(--surface2)", borderRadius: 6, padding: "0.85rem",
              color: "var(--text)", border: "1px solid var(--border)",
            }}>{prompt.prompt_text}</pre>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Réponse obtenue</p>
            <pre style={{
              whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.8rem",
              background: "var(--surface2)", borderRadius: 6, padding: "0.85rem",
              color: "var(--text-muted)", border: "1px solid var(--border)", maxHeight: 260, overflowY: "auto",
            }}>{prompt.reponse_llm}</pre>
          </div>

          <div>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Suppositions de {prompt.auteur}</p>
            <p style={{ fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>{prompt.suppositions}</p>
          </div>
        </div>
      )}

      {/* Évaluation */}
      {!evaluation ? (
        <div className="card" style={{ opacity: 0.5 }}>
          <span className="text-muted" style={{ fontSize: "0.875rem" }}>
            ⏳ Évaluation non encore soumise{evaluateur ? ` par ${evaluateur}` : ""}.
          </span>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <span style={{
              background: "var(--accent-dim)", color: "var(--accent)", borderRadius: "50%",
              width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
            }}>3</span>
            <h2 style={{ fontSize: "1rem" }}>
              Évaluation par <strong>{evaluation.evaluateur}</strong>
              {moyenne_notes && (
                <span style={{
                  marginLeft: "0.75rem", fontSize: "0.875rem",
                  background: "var(--accent-dim)", color: "var(--accent)",
                  borderRadius: 6, padding: "0.15rem 0.5rem",
                }}>
                  {moyenne_notes} / 5 moy.
                </span>
              )}
            </h2>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            {notes.map((n, i) => <NoteBar key={i} label={CRITERES[i]} value={n} />)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--success)", marginBottom: "0.4rem" }}>✓ Point fort</p>
              <p style={{ fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>{evaluation.point_fort}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--warning)", marginBottom: "0.4rem" }}>△ Amélioration</p>
              <p style={{ fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>{evaluation.amelioration}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DebriefPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [chains, setChains] = useState<Chain[]>([]);
  const [selected, setSelected] = useState<number>(0);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) { setAuthError("Mot de passe incorrect."); return; }
    setAuthed(true);
  }

  const loadChains = useCallback(async () => {
    const res = await fetch("/api/admin/debrief", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      const data = await res.json();
      setChains(data.chains);
    }
  }, [password]);

  useEffect(() => {
    if (authed) loadChains();
  }, [authed, loadChains]);

  if (!authed) return (
    <main className="page" style={{ maxWidth: 400, paddingTop: "4rem" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Débrief formateur</h1>
      <p className="subtitle" style={{ marginBottom: "2rem" }}>TP7 — Vue complète par besoin</p>
      <div className="card">
        <form onSubmit={login}>
          <div className="field">
            <label>Mot de passe formateur</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
          </div>
          {authError && <div className="error-msg">{authError}</div>}
          <div className="spacer" />
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Accéder →</button>
        </form>
      </div>
      <p className="text-muted" style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <a href="/admin">← Tableau de bord</a>
      </p>
    </main>
  );

  if (chains.length === 0) return (
    <main className="page" style={{ paddingTop: "3rem" }}>
      <p className="text-muted">Aucune donnée disponible.</p>
      <div className="spacer" />
      <a href="/admin" className="btn btn-ghost">← Tableau de bord</a>
    </main>
  );

  const current = chains[selected];

  return (
    <main style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh" }}>

      {/* Sidebar */}
      <nav style={{
        background: "var(--surface)", borderRight: "1px solid var(--border)",
        padding: "1.5rem 0", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "0 1rem 1rem", borderBottom: "1px solid var(--border)", marginBottom: "0.5rem" }}>
          <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>
            Débrief TP7
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {chains.length} besoin{chains.length > 1 ? "s" : ""}
          </p>
        </div>

        {chains.map((c, i) => {
          const complete = !!c.prompt && !!c.evaluation;
          const partial  = !!c.prompt && !c.evaluation;
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                background: selected === i ? "var(--accent-dim)" : "transparent",
                border: "none", borderLeft: selected === i ? "3px solid var(--accent)" : "3px solid transparent",
                cursor: "pointer", padding: "0.65rem 1rem",
                textAlign: "left", width: "100%", color: selected === i ? "var(--text)" : "var(--text-muted)",
                fontFamily: "var(--font)", fontSize: "0.875rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: selected === i ? 600 : 400 }}>{c.besoin.prenom}</span>
              <span style={{ fontSize: "0.7rem" }}>
                {complete ? <span className="text-success">●</span>
                  : partial ? <span className="text-warning">●</span>
                  : <span style={{ color: "var(--border)" }}>●</span>}
              </span>
            </button>
          );
        })}

        <div style={{ marginTop: "auto", padding: "1rem", borderTop: "1px solid var(--border)" }}>
          <a href="/admin" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>← Tableau de bord</a>
        </div>
      </nav>

      {/* Main */}
      <div style={{ padding: "2rem 2rem 4rem", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.25rem" }}>
              Besoin de <strong>{current.besoin.prenom}</strong>
            </h1>
            <p className="text-muted" style={{ fontSize: "0.8rem" }}>
              Prompté par {current.prompteur ?? "—"} · Évalué par {current.evaluateur ?? "—"}
              {current.moyenne_notes && ` · Moyenne : ${current.moyenne_notes}/5`}
            </p>
          </div>
          <button
            className="btn btn-ghost"
            style={{ marginLeft: "auto", fontSize: "0.8rem" }}
            onClick={loadChains}
          >↺ Actualiser</button>
        </div>

        <ChainView chain={current} />

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
          <button
            className="btn btn-ghost"
            disabled={selected === 0}
            onClick={() => setSelected(s => s - 1)}
          >← Précédent</button>
          <span className="text-muted" style={{ fontSize: "0.8rem", alignSelf: "center" }}>
            {selected + 1} / {chains.length}
          </span>
          <button
            className="btn btn-ghost"
            disabled={selected === chains.length - 1}
            onClick={() => setSelected(s => s + 1)}
          >Suivant →</button>
        </div>
      </div>
    </main>
  );
}
