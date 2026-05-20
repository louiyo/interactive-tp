import { NextRequest, NextResponse } from "next/server";
import { getState } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const stored = getState("admin_password");
  if (password !== stored) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
