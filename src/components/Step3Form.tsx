"use client";
import { useState } from "react";

type PromptAssigne = {
  prompt: {
    auteur: string;
    besoin_de: string;
    prompt_text: string;
    reponse_llm: string;
    suppositions: string;
  };
  besoin: {
    prenom: string;
    contexte: string;
    tache: string;
    contraintes: string;
    criteres: string;
  } | null;
};

const CRITERES = [
  "Le rôle assigné est pertinent pour ce besoin",
  "Le contexte fourni est suffisant",
  "L'instruction est claire et non ambiguë",
  "Le format de sortie correspond au livrable attendu",
  "Les contraintes et critères de qualité sont bien choisis",
];

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="rating-row">
      <span className="rating-label">{label}</span>
      <div className="stars">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" className={`star-btn ${value === n ? "selected" : ""}`} onClick={() => onChange(n)}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Step3Form({
  prenom,
  promptAssigne,
  onSuccess,
}: {
  prenom: string;
  promptAssigne: PromptAssigne;
  onSuccess: () => void;
}) {
  const [notes, setNotes] = useState([0, 0, 0, 0, 0]);
  const [form, setForm] = useState({ point_fort: "", amelioration: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setNote = (i: number) => (v: number) => setNotes(n => n.map((x, j) => j === i ? v : x));
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const { prompt, besoin } = promptAssigne;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (notes.some(n => n === 0)) { setError("Attribuez une note à chaque critère."); return; }
    if (!form.point_fort || !form.amelioration) { setError("Tous les champs sont requis."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evaluateur: prenom,
        note1: notes[0], note2: notes[1], note3: notes[2], note4: notes[3], note5: notes[4],
        ...form,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Erreur inconnue."); return; }
    onSuccess();
  }

  return (
    <div>
      {besoin && (
        <div className="info-block" style={{ marginBottom: "1rem" }}>
          <h4>Besoin original — {besoin.prenom}</h4>
          <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "0.4rem 1rem", fontSize: "0.875rem" }}>
            <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Contexte</dt>
            <dd>{besoin.contexte}</dd>
            <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Tâche</dt>
            <dd>{besoin.tache}</dd>
            <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Contraintes</dt>
            <dd>{besoin.contraintes}</dd>
            <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Critères de succès</dt>
            <dd>{besoin.criteres}</dd>
          </dl>
        </div>
      )}

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
          Prompt rédigé par {prompt.auteur}
        </h4>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.875rem", color: "var(--text)", fontFamily: "monospace", background: "var(--surface2)", borderRadius: "6px", padding: "1rem" }}>
          {prompt.prompt_text}
        </pre>
      </div>

      <form onSubmit={submit}>
        <div className="card">
          <h2 style={{ marginBottom: "1.25rem" }}>Grille d'évaluation</h2>
          <div className="rating-group">
            {CRITERES.map((c, i) => (
              <RatingRow key={i} label={c} value={notes[i]} onChange={setNote(i)} />
            ))}
          </div>

          <hr className="divider" />

          <div className="field">
            <label>Point fort — qu'est-ce que ce prompt fait vraiment bien ?</label>
            <textarea rows={3} value={form.point_fort} onChange={set("point_fort")} placeholder="Ce qui est réussi par rapport au besoin…" />
          </div>
          <div className="field">
            <label>Amélioration principale — si vous ne pouviez changer qu'une chose ?</label>
            <textarea rows={3} value={form.amelioration} onChange={set("amelioration")} placeholder="La modification qui aurait le plus d'impact…" />
          </div>

          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Envoi…" : "Soumettre mon évaluation →"}
          </button>
        </div>
      </form>
    </div>
  );
}
