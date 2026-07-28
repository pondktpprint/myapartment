import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const globalDb = globalThis as typeof globalThis & { __baanraoDb?: Database.Database };

function createDatabase() {
  const dataDir = process.env.DATA_DIR || join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  const db = new Database(join(dataDir, "baanrao.sqlite"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      water_rate REAL NOT NULL,
      electric_rate REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      site INTEGER NOT NULL,
      rent REAL NOT NULL,
      tenant TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      old_water REAL NOT NULL DEFAULT 0,
      new_water REAL NOT NULL DEFAULT 0,
      old_electric REAL NOT NULL DEFAULT 0,
      new_electric REAL NOT NULL DEFAULT 0,
      meter_photo_key TEXT NOT NULL DEFAULT '',
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (site) REFERENCES locations(id)
    );
  `);
  return db;
}

export function getDb() {
  globalDb.__baanraoDb ??= createDatabase();
  return globalDb.__baanraoDb;
}

export function getDataDir() {
  return process.env.DATA_DIR || join(process.cwd(), "data");
}
