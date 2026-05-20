import { NextResponse } from "next/server";
import { getAllBesoins, getAllPrompts, getAllEvaluations, getAllAssignations1 } from "@/lib/db";

// Returns the list of all known participant names (anyone who has submitted anything)
export async function GET() {
  const besoins  = getAllBesoins().map(b => b.prenom);
  const prompts  = getAllPrompts().map(p => p.auteur);
  const evals    = getAllEvaluations().map(e => e.evaluateur);
  const assigns  = getAllAssignations1().map(a => a.prompteur);

  const all = [...new Set([...besoins, ...prompts, ...evals, ...assigns])].sort();
  return NextResponse.json({ participants: all });
}
