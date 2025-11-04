import { db } from '../db';

export function startOrGetProgress(userId: string, encuestaId: string) {
  const row = db.getFirstSync(
    'SELECT * FROM questionnaire_progress WHERE user_id=? AND encuesta_id=? AND status=? LIMIT 1',
    [userId, encuestaId, 'in_progress']
  ) as any;
  if (row) {
    console.log('[DB] startOrGetProgress', { userId, encuestaId, created: false, progressId: row.id });
    return row;
  }
  db.runSync('INSERT INTO questionnaire_progress(user_id, encuesta_id, status) VALUES(?,?,?)', [userId, encuestaId, 'in_progress']);
  const created = db.getFirstSync('SELECT * FROM questionnaire_progress WHERE rowid=last_insert_rowid()') as any;
  console.log('[DB] startOrGetProgress', { userId, encuestaId, created: true, progressId: created?.id });
  return created;
}

export function completeProgress(progressId: number) {
  db.runSync('UPDATE questionnaire_progress SET status=?, completed_at=datetime("now") WHERE id=?', ['completed', progressId]);
}

export function saveSelectedReasons(progressId: number, motivoIds: string[]) {
  // Clear existing, then insert current selection
  console.log('[DB] saveSelectedReasons CLEAR', { progressId });
  db.runSync('DELETE FROM selected_reasons WHERE progress_id=?', [progressId]);
  const stmt = db.prepareSync('INSERT OR IGNORE INTO selected_reasons(progress_id, motivo_id, selected) VALUES(?,?,1)');
  try {
    db.runSync('BEGIN');
    for (const m of motivoIds) stmt.executeSync([progressId, m]);
    db.runSync('COMMIT');
    console.log('[DB] saveSelectedReasons INSERT', { progressId, count: motivoIds.length });
  } catch (e) {
    db.runSync('ROLLBACK');
    throw e;
  } finally {
    stmt.finalizeSync();
  }
}

export function listSelectedReasons(progressId: number): string[] {
  const rows = db.getAllSync('SELECT motivo_id FROM selected_reasons WHERE progress_id=?', [progressId]) as any[];
  console.log('[DB] listSelectedReasons', { progressId, count: rows.length });
  return rows.map(r => String(r.motivo_id));
}

export function saveIntensity(progressId: number, motivoId: string, intensidadId: string, peso: number) {
  db.runSync(
    'INSERT INTO reason_intensities(progress_id, motivo_id, intensidad_id, peso) VALUES(?,?,?,?) ON CONFLICT(progress_id, motivo_id) DO UPDATE SET intensidad_id=excluded.intensidad_id, peso=excluded.peso, answered_at=datetime("now")',
    [progressId, motivoId, intensidadId, peso]
  );
  console.log('[DB] upsert reason_intensity', { progressId, motivoId, intensidadId, peso });
}

export function getAnsweredMotivoIds(progressId: number): string[] {
  const rows = db.getAllSync('SELECT motivo_id FROM reason_intensities WHERE progress_id=?', [progressId]) as any[];
  return rows.map(r => String(r.motivo_id));
}

export function getSummary(progressId: number) {
  const rows = db.getAllSync('SELECT motivo_id, intensidad_id, peso FROM reason_intensities WHERE progress_id=?', [progressId]) as any[];
  return rows;
}

export function getInProgressForUser(userId: string) {
  const row = db.getFirstSync(
    'SELECT * FROM questionnaire_progress WHERE user_id=? AND status=? ORDER BY started_at DESC LIMIT 1',
    [userId, 'in_progress']
  ) as any;
  console.log('[DB] getInProgressForUser', { userId, found: !!row, encuestaId: row?.encuesta_id, progressId: row?.id });
  return row || null;
}

export function listUnansweredMotivoIds(progressId: number, motivoIds: string[]): string[] {
  if (!motivoIds?.length) return [];
  const rows = db.getAllSync('SELECT motivo_id FROM reason_intensities WHERE progress_id=?', [progressId]) as any[];
  const answered = new Set(rows.map(r => String(r.motivo_id)));
  const result = motivoIds.filter(id => !answered.has(String(id)));
  console.log('[DB] listUnanswered', { progressId, selected: motivoIds.length, answered: rows.length, result: result.length });
  return result;
}

export function hasCompleted(userId: string, encuestaId: string) {
  const row = db.getFirstSync(
    'SELECT id FROM questionnaire_progress WHERE user_id=? AND encuesta_id=? AND status=? LIMIT 1',
    [userId, encuestaId, 'completed']
  ) as any;
  return !!row;
}

export function closeOtherInProgressForSameSurvey(userId: string, encuestaId: string, keepProgressId: number) {
  const rows = db.getAllSync(
    'SELECT id FROM questionnaire_progress WHERE user_id=? AND encuesta_id=? AND status=?',
    [userId, encuestaId, 'in_progress']
  ) as any[];
  for (const r of rows) {
    if (r.id !== keepProgressId) {
      db.runSync('UPDATE questionnaire_progress SET status=?, completed_at=datetime("now") WHERE id=?', ['completed', r.id]);
      console.log('[DB] closed stale in_progress', { survey: encuestaId, progressId: r.id });
    }
  }
}

export function clearAllProgressForUser(userId: string) {
  const rows = db.getAllSync('SELECT id FROM questionnaire_progress WHERE user_id=?', [userId]) as any[];
  const ids = rows.map(r => r.id);
  db.runSync('BEGIN');
  try {
    for (const id of ids) {
      db.runSync('DELETE FROM selected_reasons WHERE progress_id=?', [id]);
      db.runSync('DELETE FROM reason_intensities WHERE progress_id=?', [id]);
    }
    db.runSync('DELETE FROM questionnaire_progress WHERE user_id=?', [userId]);
    db.runSync('COMMIT');
  } catch (e) {
    db.runSync('ROLLBACK');
    throw e;
  }
}
export function listAllProgress(userId: string) {
return db.getAllSync(
'SELECT id, encuesta_id, status, started_at, completed_at FROM questionnaire_progress WHERE user_id=? ORDER BY started_at ASC',
[userId]
) as any[];
}

export function listReasonsForProgress(progressId: number) {
return db.getAllSync(
'SELECT motivo_id FROM selected_reasons WHERE progress_id=?',
[progressId]
) as any[];
}

export function listIntensitiesForProgress(progressId: number) {
return db.getAllSync(
'SELECT motivo_id, intensidad_id, peso, answered_at FROM reason_intensities WHERE progress_id=? ORDER BY answered_at ASC',
[progressId]
) as any[];
}