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

  const besoins      = getAllBesoins();
  const assignations1 = getAllAssignations1();
  const prompts      = getAllPrompts();
  const assignations2 = getAllAssignations2();
  const evaluations  = getAllEvaluations();

  // Build one chain per besoin
  const chains = besoins.map(besoin => {
    // Who was assigned to prompt this besoin?
    const a1 = assignations1.find(a => a.source.toLowerCase() === besoin.prenom.toLowerCase());
    const prompt = a1 ? prompts.find(p => p.auteur.toLowerCase() === a1.prompteur.toLowerCase()) : null;

    // Who was assigned to evaluate that prompt?
    const a2 = prompt
      ? assignations2.find(a => a.source_auteur_prompt.toLowerCase() === prompt.auteur.toLowerCase())
      : null;
    const evaluation = a2
      ? evaluations.find(e => e.evaluateur.toLowerCase() === a2.evaluateur.toLowerCase())
      : null;

    const notes = evaluation
      ? [evaluation.note1, evaluation.note2, evaluation.note3, evaluation.note4, evaluation.note5]
      : [];
    const avg = notes.length
      ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1)
      : null;

    return {
      besoin,
      prompteur: a1?.prompteur ?? null,
      prompt: prompt ?? null,
      evaluateur: a2?.evaluateur ?? null,
      evaluation: evaluation ?? null,
      moyenne_notes: avg,
    };
  });

  return NextResponse.json({ chains });
}
