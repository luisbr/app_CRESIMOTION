import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('clinicly.db');

export function migrate() {
  db.execSync(`
    PRAGMA journal_mode = wal;
    CREATE TABLE IF NOT EXISTS questionnaire_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      encuesta_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_qp_user_s ON questionnaire_progress(user_id, encuesta_id, status);

    CREATE TABLE IF NOT EXISTS selected_reasons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      progress_id INTEGER NOT NULL,
      motivo_id TEXT NOT NULL,
      selected INTEGER NOT NULL DEFAULT 1,
      UNIQUE(progress_id, motivo_id)
    );
    CREATE INDEX IF NOT EXISTS idx_sr_progress ON selected_reasons(progress_id);

    CREATE TABLE IF NOT EXISTS reason_intensities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      progress_id INTEGER NOT NULL,
      motivo_id TEXT NOT NULL,
      intensidad_id TEXT NOT NULL,
      peso INTEGER NOT NULL,
      answered_at TEXT DEFAULT (datetime('now')),
      UNIQUE(progress_id, motivo_id)
    );
    CREATE INDEX IF NOT EXISTS idx_ri_progress ON reason_intensities(progress_id);
  `);
}

