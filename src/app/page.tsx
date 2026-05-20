"use client";
import { useState, useEffect } from "react";
import StepRouter from "@/components/StepRouter";

export default function Home() {
  const [prenom, setPrenom] = useState("");
  const [confirmed, setConfirmed] = useState("");
  const [error, setError] = useState("");
  const [known, setKnown] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/participants")
      .then(r => r.json())
      .then(d => setKnown(d.participants ?? []))
      .catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = prenom.trim();
    if (!v) { setError("Merci de saisir votre prénom."); return; }
    setError("");
    setConfirmed(v);
  }

  if (confirmed) return <StepRouter prenom={confirmed} onLogout={() => setConfirmed("")} />;

  return (
    <main className="page" style={{ maxWidth: 460, paddingTop: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1>TP7</h1>
        <p className="subtitle">Prompting collaboratif — 3 étapes</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="prenom">Votre prénom</label>

            {known.length > 0 && (
              <>
                <select
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    color: known.includes(prenom) ? "var(--text)" : "var(--text-muted)",
                    fontFamily: "var(--font)",
                    fontSize: "0.95rem",
                    padding: "0.65rem 0.85rem",
                    marginBottom: "0.5rem",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  value={known.includes(prenom) ? prenom : ""}
                  onChange={e => { if (e.target.value) setPrenom(e.target.value); }}
                >
                  <option value="">— Reprendre une session existante —</option>
                  {known.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <p className="hint" style={{ marginBottom: "0.5rem" }}>ou entrez un nouveau prénom :</p>
              </>
            )}

            <input
              id="prenom"
              type="text"
              placeholder="ex. Alice"
              value={prenom}
              onChange={e => setPrenom(e.target.value)}
              autoFocus={known.length === 0}
            />
            <p className="hint">Utilisez exactement le même prénom à chaque connexion.</p>
          </div>

          {error && <div className="error-msg">{error}</div>}
          <div className="spacer" />
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Accéder →
          </button>
        </form>
      </div>

      <p className="text-muted" style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <a href="/admin">Accès formateur</a>
      </p>
    </main>
  );
}
