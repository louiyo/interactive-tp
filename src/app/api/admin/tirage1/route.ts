import { NextRequest, NextResponse } from "next/server";
import { getState, setState, getAllBesoins, insertAssignations1 } from "@/lib/db";
import { derangement } from "@/lib/tirage";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== getState("admin_password")) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const besoins = getAllBesoins();
  if (besoins.length < 2) {
    return NextResponse.json({ error: "Il faut au moins 2 besoins soumis." }, { status: 400 });
  }

  const prenoms = besoins.map(b => b.prenom);
  const assigned = derangement(prenoms);

  const pairs = prenoms.map((prompteur, i) => ({
    prompteur,
    source: assigned[i],
  }));

  insertAssignations1(pairs);
  setState("step", "2");

  return NextResponse.json({ ok: true, pairs });
}
