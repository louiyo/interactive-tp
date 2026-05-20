"use client";
import { useEffect, useState, useCallback } from "react";
import Step1Form from "./Step1Form";
import Step2Form from "./Step2Form";
import Step3Form from "./Step3Form";

type SessionData = {
  prenom: string;
  step: number;
  doneBesoin: boolean;
  donePrompt: boolean;
  doneEval: boolean;
  monBesoin: { prenom: string; contexte: string; tache: string; contraintes: string; criteres: string } | null;
  besoinAssigne: {
    prenom: string;
    contexte: string;
    tache: string;
    contraintes: string;
    criteres: string;
  } | null;
  promptAssigne: {
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
  } | null;
};

export default function StepRouter({ prenom, onLogout }: { prenom: string; onLogout: () => void }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/session?prenom=${encodeURIComponent(prenom)}`);
      if (!res.ok) throw new Error("Erreur serveur");
      setSession(await res.json());
    } catch {
      setError("Impossible de charger votre session. Vérifiez la connexion.");
    } finally {
      setLoading(false);
    }
  }, [prenom]);

  useEffect(() => { loadSession(); }, [loadSession]);

  // Auto-poll toutes les 5s quand le participant attend une action du formateur
  useEffect(() => {
    if (!session) return;
    const isWaiting =
      (session.step === 1 && session.doneBesoin) ||
      (session.step === 2 && !session.besoinAssigne) ||
      (session.step === 2 && session.donePrompt) ||
      (session.step === 3 && !session.promptAssigne);
    if (!isWaiting) return;
    const t = setInterval(loadSession, 5000);
    return () => clearInterval(t);
  }, [session, loadSession]);

  const [showBesoin, setShowBesoin] = useState(false);

  if (loading) return (
    <div className="page" style={{ paddingTop: "3rem" }}>
      <p className="text-muted">Chargement…</p>
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="error-msg">{error}</div>
      <div className="spacer" />
      <button className="btn btn-ghost" onClick={onLogout}>← Retour</button>
    </div>
  );

  if (!session) return null;

  const header = (
    <div className="flex" style={{ marginBottom: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Bonjour, {prenom}</h1>
        <p className="text-muted" style={{ fontSize: "0.8rem" }}>TP7 — Prompting collaboratif</p>
      </div>
      <button className="btn btn-ghost ml-auto" style={{ fontSize: "0.8rem" }} onClick={onLogout}>
        Déconnexion
      </button>
    </div>
  );

  const stepBar = (
    <div className="steps">
      <div className={`step-item ${session.step === 1 ? "active" : session.doneBesoin ? "done" : ""}`}>
        {session.doneBesoin ? "✓ " : ""}Étape 1 — Votre besoin
      </div>
      <div className={`step-item ${session.step === 2 ? "active" : session.donePrompt ? "done" : ""}`}>
        {session.donePrompt ? "✓ " : ""}Étape 2 — Rédiger un prompt
      </div>
      <div className={`step-item ${session.step === 3 ? "active" : session.doneEval ? "done" : ""}`}>
        {session.doneEval ? "✓ " : ""}Étape 3 — Évaluer
      </div>
    </div>
  );

  return (
    <div className="page">
      {header}
      {stepBar}

      {/* Rappel du besoin personnel — visible dès l'étape 1 validée */}
      {session.doneBesoin && session.monBesoin && (
        <div style={{ marginBottom: "1rem" }}>
          <button
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "space-between", fontSize: "0.85rem" }}
            onClick={() => setShowBesoin(v => !v)}
          >
            <span>📋 Voir mon besoin</span>
            <span>{showBesoin ? "▲" : "▼"}</span>
          </button>
          {showBesoin && (
            <div className="card" style={{ marginTop: "0.5rem", borderColor: "var(--accent-dim)" }}>
              <dl style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "0.5rem 1rem", fontSize: "0.875rem" }}>
                <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Contexte</dt>
                <dd style={{ whiteSpace: "pre-wrap" }}>{session.monBesoin.contexte}</dd>
                <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Tâche</dt>
                <dd style={{ whiteSpace: "pre-wrap" }}>{session.monBesoin.tache}</dd>
                <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Contraintes</dt>
                <dd style={{ whiteSpace: "pre-wrap" }}>{session.monBesoin.contraintes}</dd>
                <dt style={{ color: "var(--text-muted)", fontWeight: 600 }}>Critères</dt>
                <dd style={{ whiteSpace: "pre-wrap" }}>{session.monBesoin.criteres}</dd>
              </dl>
            </div>
          )}
        </div>
      )}
      {/* Step 1 */}
      {session.step === 1 && (
        session.doneBesoin
          ? <DoneCard message="Votre besoin a été soumis." detail="Le formateur va lancer le tirage. Vous recevrez votre assignation ici." />
          : <Step1Form prenom={prenom} onSuccess={loadSession} />
      )}

      {/* Step 2 */}
      {session.step === 2 && (
        !session.besoinAssigne
          ? <DoneCard message="En attente de l'assignation." detail="Le formateur n'a pas encore lancé le tirage 1, ou vous n'étiez pas présent à l'étape 1." />
          : session.donePrompt
            ? <DoneCard message="Votre prompt a été soumis." detail="Attendez que le formateur lance le tirage 2 pour passer à l'évaluation." />
            : <Step2Form prenom={prenom} besoinAssigne={session.besoinAssigne} onSuccess={loadSession} />
      )}

      {/* Step 3 */}
      {session.step === 3 && (
        !session.promptAssigne
          ? <DoneCard message="En attente de l'assignation." detail="Le formateur n'a pas encore lancé le tirage 2." />
          : session.doneEval
            ? <DoneCard message="Votre évaluation a été soumise. ✓" detail="Merci — le formateur va lancer le débriefing collectif." success />
            : <Step3Form prenom={prenom} promptAssigne={session.promptAssigne} onSuccess={loadSession} />
      )}
    </div>
  );
}

function DoneCard({ message, detail, success }: { message: string; detail: string; success?: boolean }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
      <div style={{ fontSize: "2rem" }}>{success ? "✅" : "⏳"}</div>
      <h2 style={{ marginTop: "0.75rem" }}>{message}</h2>
      <p className="text-muted" style={{ marginTop: "0.5rem" }}>{detail}</p>
      {!success && (
        <p className="text-muted" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
          Cette page se met à jour automatiquement — pas besoin de rafraîchir.
        </p>
      )}
    </div>
  );
}
