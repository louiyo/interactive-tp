import { NextRequest, NextResponse } from "next/server";
import { getAssignation2, getPromptByAuteur, getEvaluationByEvaluateur, insertEvaluation } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { evaluateur, note1, note2, note3, note4, note5, point_fort, amelioration } = body;

  if (!evaluateur || !note1 || !note2 || !note3 || !note4 || !note5 || !point_fort || !amelioration) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  const source_auteur = getAssignation2(evaluateur.trim());
  if (!source_auteur) {
    return NextResponse.json({ error: "Aucune assignation trouvée. Le tirage 2 n'a pas encore eu lieu." }, { status: 400 });
  }

  const existing = getEvaluationByEvaluateur(evaluateur.trim());
  if (existing) {
    return NextResponse.json({ error: "Ce prénom a déjà soumis une évaluation. Si c'est vous, reconnectez-vous avec le même prénom pour retrouver votre session." }, { status: 409 });
  }

  insertEvaluation({
    evaluateur: evaluateur.trim(),
    auteur_prompt: source_auteur,
    note1: parseInt(note1),
    note2: parseInt(note2),
    note3: parseInt(note3),
    note4: parseInt(note4),
    note5: parseInt(note5),
    point_fort: point_fort.trim(),
    amelioration: amelioration.trim(),
  });

  return NextResponse.json({ ok: true });
}
