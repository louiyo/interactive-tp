import { NextRequest, NextResponse } from "next/server";
import { getState, setState, getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== getState("admin_password")) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const db = getDb();
  db.exec(`
    DELETE FROM evaluations;
    DELETE FROM assignations2;
    DELETE FROM prompts;
    DELETE FROM assignations1;
    DELETE FROM besoins;
  `);
  setState("step", "1");

  return NextResponse.json({ ok: true });
}
