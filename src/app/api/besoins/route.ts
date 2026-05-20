import { NextRequest, NextResponse } from "next/server";
import { getBesoinByPrenom, insertBesoin } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prenom, contexte, tache, contraintes, criteres } = body;

  if (!prenom || !contexte || !tache || !contraintes || !criteres) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  const existing = getBesoinByPrenom(prenom.trim());
  if (existing) {
    return NextResponse.json({ error: "Ce prénom a déjà soumis un besoin. Si c'est vous, reconnectez-vous avec le même prénom pour retrouver votre session." }, { status: 409 });
  }

  insertBesoin({
    prenom: prenom.trim(),
    contexte: contexte.trim(),
    tache: tache.trim(),
    contraintes: contraintes.trim(),
    criteres: criteres.trim(),
  });

  return NextResponse.json({ ok: true });
}
