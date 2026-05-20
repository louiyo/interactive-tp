"use client";
import { useState } from "react";

type Besoin = { prenom: string; contexte: string; tache: string; contraintes: string; criteres: string };

export default function Step2Form({
  prenom,
  besoinAssigne,
  onSuccess,
}: {
  prenom: string;
  besoinAssigne: Besoin;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({ prompt_text: "", reponse_llm: "", suppositions: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.prompt_text || !form.reponse_llm || !form.suppositions) {
      setError("Tous les champs sont requis."); return;
    }
    setLoading(true); setError("");
    const res = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auteur: prenom, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Erreur inconnue."); return; }
    onSuccess();
  }

  return (
    <div>
      <div className="info-block">
        <h4>Besoin à prompter — {besoinAssigne.prenom}</h4>
        <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "0.4rem 1rem", fontSize: "0.875rem" }}>
          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Contexte</dt>
          <dd>{besoinAssigne.contexte}</dd>
          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Tâche</dt>
          <dd>{besoinAssigne.tache}</dd>
          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Contraintes</dt>
          <dd>{besoinAssigne.contraintes}</dd>
          <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Critères de succès</dt>
          <dd>{besoinAssigne.criteres}</dd>
        </dl>
      </div>

      <form onSubmit={submit}>
        <div className="card">
          <div className="field">
            <label>Votre prompt complet</label>
            <textarea
              rows={8}
              placeholder="Rédigez ici le prompt complet que vous soumettriez au modèle (rôle, contexte, instruction, format, contraintes)."
              value={form.prompt_text}
              onChange={set("prompt_text")}
            />
          </div>
          <div className="field">
            <label>Réponse obtenue du modèle</label>
            <textarea
              rows={6}
              placeholder="Collez ici la réponse brute obtenue après avoir exécuté votre prompt."
              value={form.reponse_llm}
              onChange={set("reponse_llm")}
            />
          </div>
          <div className="field">
            <label>Vos 3 suppositions sur ce besoin</label>
            <textarea
              rows={4}
              placeholder={"1. J'ai supposé que…\n2. J'ai supposé que…\n3. J'ai supposé que…"}
              value={form.suppositions}
              onChange={set("suppositions")}
            />
            <p className="hint">Ce que vous avez déduit du besoin sans pouvoir le confirmer.</p>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Envoi…" : "Soumettre mon prompt →"}
          </button>
        </div>
      </form>
    </div>
  );
}
