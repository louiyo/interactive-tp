import { NextRequest, NextResponse } from "next/server";
import {
  getState,
  getBesoinByPrenom,
  getAssignation1,
  getBesoinByPrenom as getBesoin,
  getPromptByAuteur,
  getAssignation2,
  getEvaluationByEvaluateur,
  getAllBesoins,
  getAllPrompts,
  getAllEvaluations,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  const prenom = req.nextUrl.searchParams.get("prenom")?.trim();
  if (!prenom) return NextResponse.json({ error: "prenom requis" }, { status: 400 });

  const step = parseInt(getState("step") ?? "1");
  const besoin = getBesoinByPrenom(prenom);

  // What has this participant already done?
  const doneBesoin = !!besoin;
  const assignation1 = getAssignation1(prenom);     // who they must prompt
  const besoinAssigne = assignation1 ? getBesoin(assignation1) : null;
  const donePrompt = !!getPromptByAuteur(prenom);
  const assignation2 = getAssignation2(prenom);     // whose prompt they evaluate
  const promptAssigne = assignation2 ? getPromptByAuteur(assignation2) : null;
  const besoinDuPromptAssigne = promptAssigne ? getBesoin(promptAssigne.besoin_de) : null;
  const doneEval = !!getEvaluationByEvaluateur(prenom);

  return NextResponse.json({
    prenom,
    step,
    doneBesoin,
    donePrompt,
    doneEval,
    monBesoin: besoin ?? null,
    besoinAssigne: assignation1 ? besoinAssigne : null,
    promptAssigne: assignation2 ? { prompt: promptAssigne, besoin: besoinDuPromptAssigne } : null,
  });
}
