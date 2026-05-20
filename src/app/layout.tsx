import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TP7 — Prompting Collaboratif",
  description: "Exercice collaboratif de prompting en 3 étapes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
