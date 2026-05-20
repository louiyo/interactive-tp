import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "tp7.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS besoins (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      prenom      TEXT NOT NULL UNIQUE,
      contexte    TEXT NOT NULL,
      tache       TEXT NOT NULL,
      contraintes TEXT NOT NULL,
      criteres    TEXT NOT NULL,
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assignations1 (
      prompteur TEXT PRIMARY KEY,
      source    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prompts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      auteur       TEXT NOT NULL UNIQUE,
      besoin_de    TEXT NOT NULL,
      prompt_text  TEXT NOT NULL,
      reponse_llm  TEXT NOT NULL,
      suppositions TEXT NOT NULL,
      created_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assignations2 (
      evaluateur          TEXT PRIMARY KEY,
      source_auteur_prompt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      evaluateur    TEXT NOT NULL UNIQUE,
      auteur_prompt TEXT NOT NULL,
      note1         INTEGER NOT NULL,
      note2         INTEGER NOT NULL,
      note3         INTEGER NOT NULL,
      note4         INTEGER NOT NULL,
      note5         INTEGER NOT NULL,
      point_fort    TEXT NOT NULL,
      amelioration  TEXT NOT NULL,
      created_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  // Default state
  const existing = db.prepare("SELECT value FROM app_state WHERE key = 'step'").get() as { value: string } | undefined;
  if (!existing) {
    db.prepare("INSERT INTO app_state (key, value) VALUES ('step', '1')").run();
  }
  const adminPwd = db.prepare("SELECT value FROM app_state WHERE key = 'admin_password'").get() as { value: string } | undefined;
  if (!adminPwd) {
    db.prepare("INSERT INTO app_state (key, value) VALUES ('admin_password', 'adminadmin')").run();
  }
}

export function getState(key: string): string | null {
  const db = getDb();
  const row = db.prepare("SELECT value FROM app_state WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setState(key: string, value: string): void {
  getDb().prepare("INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)").run(key, value);
}

export type Besoin = {
  id: number;
  prenom: string;
  contexte: string;
  tache: string;
  contraintes: string;
  criteres: string;
};

export type Prompt = {
  id: number;
  auteur: string;
  besoin_de: string;
  prompt_text: string;
  reponse_llm: string;
  suppositions: string;
};

export type Evaluation = {
  id: number;
  evaluateur: string;
  auteur_prompt: string;
  note1: number;
  note2: number;
  note3: number;
  note4: number;
  note5: number;
  point_fort: string;
  amelioration: string;
};

export function getAllBesoins(): Besoin[] {
  return getDb().prepare("SELECT * FROM besoins ORDER BY created_at").all() as Besoin[];
}

export function getBesoinByPrenom(prenom: string): Besoin | null {
  return (getDb().prepare("SELECT * FROM besoins WHERE LOWER(prenom) = LOWER(?)").get(prenom) as Besoin) ?? null;
}

export function insertBesoin(b: Omit<Besoin, "id">): void {
  getDb().prepare(
    "INSERT INTO besoins (prenom, contexte, tache, contraintes, criteres) VALUES (?, ?, ?, ?, ?)"
  ).run(b.prenom, b.contexte, b.tache, b.contraintes, b.criteres);
}

export function getAssignation1(prenom: string): string | null {
  const row = getDb().prepare("SELECT source FROM assignations1 WHERE LOWER(prompteur) = LOWER(?)").get(prenom) as { source: string } | undefined;
  return row?.source ?? null;
}

export function getAllAssignations1(): { prompteur: string; source: string }[] {
  return getDb().prepare("SELECT * FROM assignations1").all() as { prompteur: string; source: string }[];
}

export function insertAssignations1(pairs: { prompteur: string; source: string }[]): void {
  const db = getDb();
  const stmt = db.prepare("INSERT OR REPLACE INTO assignations1 (prompteur, source) VALUES (?, ?)");
  const run = db.transaction(() => { pairs.forEach(p => stmt.run(p.prompteur, p.source)); });
  run();
}

export function getAllPrompts(): Prompt[] {
  return getDb().prepare("SELECT * FROM prompts ORDER BY created_at").all() as Prompt[];
}

export function getPromptByAuteur(auteur: string): Prompt | null {
  return (getDb().prepare("SELECT * FROM prompts WHERE LOWER(auteur) = LOWER(?)").get(auteur) as Prompt) ?? null;
}

export function insertPrompt(p: Omit<Prompt, "id">): void {
  getDb().prepare(
    "INSERT INTO prompts (auteur, besoin_de, prompt_text, reponse_llm, suppositions) VALUES (?, ?, ?, ?, ?)"
  ).run(p.auteur, p.besoin_de, p.prompt_text, p.reponse_llm, p.suppositions);
}

export function getAssignation2(prenom: string): string | null {
  const row = getDb().prepare("SELECT source_auteur_prompt FROM assignations2 WHERE LOWER(evaluateur) = LOWER(?)").get(prenom) as { source_auteur_prompt: string } | undefined;
  return row?.source_auteur_prompt ?? null;
}

export function getAllAssignations2(): { evaluateur: string; source_auteur_prompt: string }[] {
  return getDb().prepare("SELECT * FROM assignations2").all() as { evaluateur: string; source_auteur_prompt: string }[];
}

export function insertAssignations2(pairs: { evaluateur: string; source_auteur_prompt: string }[]): void {
  const db = getDb();
  const stmt = db.prepare("INSERT OR REPLACE INTO assignations2 (evaluateur, source_auteur_prompt) VALUES (?, ?)");
  const run = db.transaction(() => { pairs.forEach(p => stmt.run(p.evaluateur, p.source_auteur_prompt)); });
  run();
}

export function getAllEvaluations(): Evaluation[] {
  return getDb().prepare("SELECT * FROM evaluations ORDER BY created_at").all() as Evaluation[];
}

export function getEvaluationByEvaluateur(evaluateur: string): Evaluation | null {
  return (getDb().prepare("SELECT * FROM evaluations WHERE LOWER(evaluateur) = LOWER(?)").get(evaluateur) as Evaluation) ?? null;
}

export function insertEvaluation(e: Omit<Evaluation, "id">): void {
  getDb().prepare(
    "INSERT INTO evaluations (evaluateur, auteur_prompt, note1, note2, note3, note4, note5, point_fort, amelioration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(e.evaluateur, e.auteur_prompt, e.note1, e.note2, e.note3, e.note4, e.note5, e.point_fort, e.amelioration);
}
