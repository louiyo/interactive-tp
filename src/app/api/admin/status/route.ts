import { NextRequest, NextResponse } from "next/server";
import {
  getState,
  getAllBesoins,
  getAllAssignations1,
  getAllPrompts,
  getAllAssignations2,
  getAllEvaluations,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== getState("admin_password")) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const step = getState("step") ?? "1";
  const besoins = getAllBesoins();
  const assignations1 = getAllAssignations1();
  const prompts = getAllPrompts();
  const assignations2 = getAllAssignations2();
  const evaluations = getAllEvaluations();

  // Build enriched view for admin
  const participants = [...new Set([
    ...besoins.map(b => b.prenom),
    ...assignations1.map(a => a.prompteur),
    ...prompts.map(p => p.auteur),
    ...assignations2.map(a => a.evaluateur),
    ...evaluations.map(e => e.evaluateur),
  ])];

  const rows = participants.map(p => {
    const b = besoins.find(x => x.prenom.toLowerCase() === p.toLowerCase());
    const a1 = assignations1.find(x => x.prompteur.toLowerCase() === p.toLowerCase());
    const pr = prompts.find(x => x.auteur.toLowerCase() === p.toLowerCase());
    const a2 = assignations2.find(x => x.evaluateur.toLowerCase() === p.toLowerCase());
    const ev = evaluations.find(x => x.evaluateur.toLowerCase() === p.toLowerCase());

    const notes = ev ? [ev.note1, ev.note2, ev.note3, ev.note4, ev.note5] : [];
    const avg = notes.length ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1) : null;

    return {
      prenom: p,
      besoin_soumis: !!b,
      assigné_à: a1?.source ?? null,
      prompt_soumis: !!pr,
      evalue_le_prompt_de: a2?.source_auteur_prompt ?? null,
      evaluation_soumise: !!ev,
      moyenne_notes: avg,
    };
  });

  return NextResponse.json({ step: parseInt(step), rows, besoins, prompts, evaluations });
}
