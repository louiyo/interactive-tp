import { NextRequest, NextResponse } from "next/server";
import { getAssignation1, getPromptByAuteur, insertPrompt } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { auteur, prompt_text, reponse_llm, suppositions } = body;

  if (!auteur || !prompt_text || !reponse_llm || !suppositions) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  const besoin_de = getAssignation1(auteur.trim());
  if (!besoin_de) {
    return NextResponse.json({ error: "Aucune assignation trouvée. Le tirage 1 n'a pas encore eu lieu." }, { status: 400 });
  }

  const existing = getPromptByAuteur(auteur.trim());
  if (existing) {
    return NextResponse.json({ error: "Ce prénom a déjà soumis un prompt. Si c'est vous, reconnectez-vous avec le même prénom pour retrouver votre session." }, { status: 409 });
  }

  insertPrompt({
    auteur: auteur.trim(),
    besoin_de,
    prompt_text: prompt_text.trim(),
    reponse_llm: reponse_llm.trim(),
    suppositions: suppositions.trim(),
  });

  return NextResponse.json({ ok: true });
}
