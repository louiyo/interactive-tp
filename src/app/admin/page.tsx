"use client";
import { useState, useEffect, useCallback } from "react";

type Row = {
  prenom: string;
  besoin_soumis: boolean;
  "assigné_à": string | null;
  prompt_soumis: boolean;
  evalue_le_prompt_de: string | null;
  evaluation_soumise: boolean;
  moyenne_notes: string | null;
};

type StatusData = {
  step: number;
  rows: Row[];
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

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

  const loadStatus = useCallback(async () => {
    const res = await fetch("/api/admin/status", { headers: { "x-admin-password": password } });
    if (res.ok) setStatus(await res.json());
  }, [password]);

  useEffect(() => {
    if (authed) loadStatus();
  }, [authed, loadStatus]);

  // Auto-refresh every 10s
  useEffect(() => {
    if (!authed) return;
    const t = setInterval(loadStatus, 10000);
    return () => clearInterval(t);
  }, [authed, loadStatus]);

  async function action(endpoint: string, confirmMsg: string) {
    if (!confirm(confirmMsg)) return;
    setLoading(true); setMsg(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setMsg({ text: data.error ?? "Erreur.", ok: false }); return; }
    setMsg({ text: "OK ✓", ok: true });
    loadStatus();
  }

  if (!authed) return (
    <main className="page" style={{ maxWidth: 400, paddingTop: "4rem" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Accès formateur</h1>
      <p className="subtitle" style={{ marginBottom: "2rem" }}>TP7 — Tableau de bord</p>
      <div className="card">
        <form onSubmit={login}>
          <div className="field">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            <p className="hint">Défaut : <code>adminadmin</code> — à changer en production.</p>
          </div>
          {authError && <div className="error-msg">{authError}</div>}
          <div className="spacer" />
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Connexion →</button>
        </form>
      </div>
      <p className="text-muted" style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <a href="/">← Retour participant</a>
      </p>
    </main>
  );

  const step = status?.step ?? 1;

  return (
    <main className="page-wide">
      <div className="flex" style={{ marginBottom: "2rem" }}>
        <div>
          <h1>Tableau de bord formateur</h1>
          <p className="subtitle">TP7 — Prompting collaboratif</p>
        </div>
        <div className="flex ml-auto" style={{ gap: "0.5rem" }}>
          <button className="btn btn-ghost" style={{ fontSize: "0.8rem" }} onClick={loadStatus}>↺ Rafraîchir</button>
          <a href="/admin/debrief" className="btn btn-ghost" style={{ fontSize: "0.8rem" }}>🗂 Débrief</a>
          <a href="/" className="btn btn-ghost" style={{ fontSize: "0.8rem" }}>← Vue participant</a>
        </div>
      </div>

      {/* Step indicator */}
      <div className="steps" style={{ marginBottom: "1.5rem" }}>
        <div className={`step-item ${step === 1 ? "active" : step > 1 ? "done" : ""}`}>Étape 1 — Besoins</div>
        <div className={`step-item ${step === 2 ? "active" : step > 2 ? "done" : ""}`}>Étape 2 — Prompts</div>
        <div className={`step-item ${step === 3 ? "active" : ""}`}>Étape 3 — Évaluations</div>
      </div>

      {/* Actions */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Actions</h2>
        <div className="flex" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          <button
            className="btn btn-primary"
            disabled={loading || step !== 1}
            onClick={() => action("/api/admin/tirage1", "Lancer le Tirage 1 ? Cela débloque l'étape 2 pour tous les participants.")}
          >
            🎲 Tirage 1 — Démarrer l'étape 2
          </button>
          <button
            className="btn btn-primary"
            disabled={loading || step !== 2}
            onClick={() => action("/api/admin/tirage2", "Lancer le Tirage 2 ? Cela débloque l'étape 3 pour tous les participants.")}
          >
            🎲 Tirage 2 — Démarrer l'étape 3
          </button>
          <button
            className="btn btn-danger"
            disabled={loading}
            onClick={() => action("/api/admin/reset", "⚠️ RESET : supprimer TOUTES les données et recommencer à l'étape 1 ?")}
          >
            ↺ Réinitialiser la session
          </button>
        </div>
        {msg && <div className={msg.ok ? "success-msg" : "error-msg"} style={{ marginTop: "0.75rem" }}>{msg.text}</div>}
      </div>

      {/* Participant table */}
      <div className="card">
        <div className="flex" style={{ marginBottom: "1rem" }}>
          <h2>Suivi des participants</h2>
          <span className="text-muted ml-auto" style={{ fontSize: "0.8rem" }}>Actualisé toutes les 10 s</span>
        </div>

        {!status ? (
          <p className="text-muted">Chargement…</p>
        ) : status.rows.length === 0 ? (
          <p className="text-muted">Aucun participant pour l'instant.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Prénom</th>
                  <th>Besoin soumis</th>
                  <th>Assigné à (T1)</th>
                  <th>Prompt soumis</th>
                  <th>Évalue le prompt de (T2)</th>
                  <th>Éval. soumise</th>
                  <th>Moy. notes</th>
                </tr>
              </thead>
              <tbody>
                {status.rows.map(r => (
                  <tr key={r.prenom}>
                    <td><strong>{r.prenom}</strong></td>
                    <td>{r.besoin_soumis ? <span className="badge badge-ok">✓</span> : <span className="badge badge-muted">—</span>}</td>
                    <td>{r["assigné_à"] ?? <span className="text-muted">—</span>}</td>
                    <td>{r.prompt_soumis ? <span className="badge badge-ok">✓</span> : <span className="badge badge-muted">—</span>}</td>
                    <td>{r.evalue_le_prompt_de ?? <span className="text-muted">—</span>}</td>
                    <td>{r.evaluation_soumise ? <span className="badge badge-ok">✓</span> : <span className="badge badge-muted">—</span>}</td>
                    <td>{r.moyenne_notes ? <strong>{r.moyenne_notes} / 5</strong> : <span className="text-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
