import { NextRequest, NextResponse } from "next/server";
import { getState, setState, getAllPrompts, getAllAssignations1, insertAssignations2 } from "@/lib/db";
import { derangement } from "@/lib/tirage";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== getState("admin_password")) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const prompts = getAllPrompts();
  if (prompts.length < 2) {
    return NextResponse.json({ error: "Il faut au moins 2 prompts soumis." }, { status: 400 });
  }

  const assignations1 = getAllAssignations1();
  const tirage1Map: Record<string, string> = {};
  assignations1.forEach(a => { tirage1Map[a.prompteur.toLowerCase()] = a.source.toLowerCase(); });

  const auteurs = prompts.map(p => p.auteur);
  // Exclude: evaluator cannot receive own prompt, and avoid T1 pair if possible
  const exclude = auteurs.map(a => tirage1Map[a.toLowerCase()] ?? null);

  const assigned = derangement(auteurs, exclude as (string | null)[]);

  const pairs = auteurs.map((evaluateur, i) => ({
    evaluateur,
    source_auteur_prompt: assigned[i],
  }));

  insertAssignations2(pairs);
  setState("step", "3");

  return NextResponse.json({ ok: true, pairs });
}
