import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const noopStatement = () => ({
  executeSync: (..._params: any[]) => ({ changes: 0 }),
  finalizeSync: () => {},
});

const createNoopDb = () => ({
  execSync: (..._sql: string[]) => {},
  getAllSync: () => [],
  getFirstSync: () => null,
  runSync: () => ({ changes: 0 }),
  prepareSync: () => noopStatement(),
});

const nativeDb = !isWeb
  ? (require('expo-sqlite').openDatabaseSync('clinicly.db') as any)
  : null;

export const db: any = nativeDb || createNoopDb();

const columnExists = (table: string, column: string) => {
  try {
    if (isWeb) return false;
    const info = db.getAllSync(`PRAGMA table_info(${table})`) as any[];
    return info?.some(col => col?.name === column);
  } catch (e) {
    console.log('[DB] columnExists error', table, column, e);
    return false;
  }
};

const ensureColumn = (table: string, column: string, definition: string, onAdd?: () => void) => {
  if (isWeb) return;
  if (!columnExists(table, column)) {
    db.execSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
    if (onAdd) onAdd();
  }
};

export function migrate() {
  if (isWeb) {
    console.log('[DB] migrate skipped on web');
    return;
  }
  db.execSync(`
    PRAGMA journal_mode = wal;
    CREATE TABLE IF NOT EXISTS healing_flows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'collecting',
      started_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_hf_user_status ON healing_flows(user_id, status);

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

  ensureColumn('questionnaire_progress', 'flow_id', 'INTEGER');
  ensureColumn('questionnaire_progress', 'updated_at', 'TEXT', () => {
    db.execSync('UPDATE questionnaire_progress SET updated_at=datetime(\'now\') WHERE updated_at IS NULL;');
  });
  db.execSync('CREATE INDEX IF NOT EXISTS idx_qp_flow ON questionnaire_progress(flow_id);');
}
