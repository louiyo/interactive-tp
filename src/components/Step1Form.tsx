"use client";
import { useState } from "react";

export default function Step1Form({ prenom, onSuccess }: { prenom: string; onSuccess: () => void }) {
  const [form, setForm] = useState({ contexte: "", tache: "", contraintes: "", criteres: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.contexte || !form.tache || !form.contraintes || !form.criteres) {
      setError("Tous les champs sont requis."); return;
    }
    setLoading(true); setError("");
    const res = await fetch("/api/besoins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prenom, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Erreur inconnue."); return; }
    onSuccess();
  }

  return (
    <form onSubmit={submit}>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Décrire votre besoin métier</h2>
        <p className="text-muted" style={{ fontSize: "0.875rem" }}>
          Pensez à une tâche complexe que vous aimeriez confier à un modèle de langage.
        </p>
      </div>

      <div className="card">
        <div className="field">
          <label>Contexte</label>
          <textarea rows={3} placeholder="Dans quel cadre intervient cette tâche ? (secteur, équipe, fréquence…)" value={form.contexte} onChange={set("contexte")} />
        </div>
        <div className="field">
          <label>Tâche</label>
          <textarea rows={3} placeholder="Que doit produire concrètement le modèle ? (livrable attendu)" value={form.tache} onChange={set("tache")} />
        </div>
        <div className="field">
          <label>Contraintes</label>
          <textarea rows={3} placeholder="Quelles sont les règles impératives ? (ton, longueur, public, format, confidentialité…)" value={form.contraintes} onChange={set("contraintes")} />
        </div>
        <div className="field">
          <label>Critères de succès</label>
          <textarea rows={3} placeholder="Comment saurez-vous que la réponse est bonne ?" value={form.criteres} onChange={set("criteres")} />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "0.5rem" }}>
          {loading ? "Envoi…" : "Soumettre mon besoin →"}
        </button>
      </div>
    </form>
  );
}
