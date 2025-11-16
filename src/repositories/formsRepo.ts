import { db } from '../db';

const ACTIVE_FLOW_STATES = ['collecting', 'ready_for_healing', 'healing'];
const READY_STAGE_STATUS = 'ready';

type FlowRow = {
  id: number;
  user_id: string;
  status: string;
};

const getActiveFlowRow = (userId: string): FlowRow | null => {
  return (
    (db.getFirstSync(
      `SELECT * FROM healing_flows WHERE user_id=? AND status IN (${ACTIVE_FLOW_STATES.map(() => '?').join(',')})
       ORDER BY started_at DESC LIMIT 1`,
      [userId, ...ACTIVE_FLOW_STATES]
    ) as FlowRow | null) || null
  );
};

const createFlowRow = (userId: string): FlowRow => {
  db.runSync('INSERT INTO healing_flows(user_id, status) VALUES(?,?)', [userId, 'collecting']);
  return db.getFirstSync('SELECT * FROM healing_flows WHERE rowid=last_insert_rowid()') as FlowRow;
};

export function getActiveFlow(userId: string): FlowRow | null {
  return getActiveFlowRow(userId);
}

export function ensureActiveFlow(userId: string): FlowRow {
  return getActiveFlowRow(userId) || createFlowRow(userId);
}

const attachLegacyProgressToFlow = (userId: string, encuestaId: string, flowId: number) => {
  const legacy = db.getFirstSync(
    'SELECT * FROM questionnaire_progress WHERE user_id=? AND encuesta_id=? AND (flow_id IS NULL OR flow_id=0) ORDER BY started_at DESC LIMIT 1',
    [userId, encuestaId]
  ) as any;
  if (!legacy) return null;
  db.runSync('UPDATE questionnaire_progress SET flow_id=?, updated_at=datetime("now") WHERE id=?', [flowId, legacy.id]);
  return {...legacy, flow_id: flowId};
};

export function startOrGetProgress(userId: string, encuestaId: string) {
  const flow = ensureActiveFlow(userId);
  if (flow.status === 'healing') {
    throw new Error('El flujo de sanación está en curso. No se pueden editar las encuestas.');
  }
  let row = db.getFirstSync(
    'SELECT * FROM questionnaire_progress WHERE user_id=? AND encuesta_id=? AND flow_id=? LIMIT 1',
    [userId, encuestaId, flow.id]
  ) as any;
  if (!row) {
    row = attachLegacyProgressToFlow(userId, encuestaId, flow.id);
  }
  if (row) {
    if (row.status === 'pending') {
      db.runSync('UPDATE questionnaire_progress SET status=?, started_at=datetime("now"), updated_at=datetime("now") WHERE id=?', ['in_progress', row.id]);
      row.status = 'in_progress';
    }
    console.log('[DB] startOrGetProgress', { userId, encuestaId, created: false, progressId: row.id, flowId: flow.id });
    return row;
  }
  db.runSync('INSERT INTO questionnaire_progress(user_id, encuesta_id, status, flow_id) VALUES(?,?,?,?)', [
    userId,
    encuestaId,
    'in_progress',
    flow.id,
  ]);
  const created = db.getFirstSync('SELECT * FROM questionnaire_progress WHERE rowid=last_insert_rowid()') as any;
  console.log('[DB] startOrGetProgress', { userId, encuestaId, created: true, progressId: created?.id, flowId: flow.id });
  return created;
}

export function completeProgress(progressId: number) {
  db.runSync(
    'UPDATE questionnaire_progress SET status=?, completed_at=datetime("now"), updated_at=datetime("now") WHERE id=?',
    [READY_STAGE_STATUS, progressId]
  );
}

export function updateProgressStatus(progressId: number, status: string) {
  db.runSync('UPDATE questionnaire_progress SET status=?, updated_at=datetime("now") WHERE id=?', [status, progressId]);
}

export function saveSelectedReasons(progressId: number, motivoIds: string[]) {
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
  const flow = getActiveFlowRow(userId);
  if (!flow) return null;
  const row = db.getFirstSync(
    'SELECT * FROM questionnaire_progress WHERE user_id=? AND flow_id=? AND status=? ORDER BY started_at DESC LIMIT 1',
    [userId, flow.id, 'in_progress']
  ) as any;
  console.log('[DB] getInProgressForUser', { userId, found: !!row, encuestaId: row?.encuesta_id, progressId: row?.id, flowId: flow.id });
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
  const flow = getActiveFlowRow(userId);
  if (!flow) return false;
  const row = db.getFirstSync(
    'SELECT id FROM questionnaire_progress WHERE user_id=? AND encuesta_id=? AND flow_id=? AND status=? LIMIT 1',
    [userId, encuestaId, flow.id, READY_STAGE_STATUS]
  ) as any;
  return !!row;
}

export function closeOtherInProgressForSameSurvey(userId: string, encuestaId: string, keepProgressId: number) {
  const flow = getActiveFlowRow(userId);
  if (!flow) return;
  const rows = db.getAllSync(
    'SELECT id FROM questionnaire_progress WHERE user_id=? AND encuesta_id=? AND flow_id=? AND status=?',
    [userId, encuestaId, flow.id, 'in_progress']
  ) as any[];
  for (const r of rows) {
    if (r.id !== keepProgressId) {
      db.runSync('UPDATE questionnaire_progress SET status=?, completed_at=datetime("now"), updated_at=datetime("now") WHERE id=?', [
        READY_STAGE_STATUS,
        r.id,
      ]);
      console.log('[DB] closed stale in_progress', { survey: encuestaId, progressId: r.id, flowId: flow.id });
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
    db.runSync('DELETE FROM healing_flows WHERE user_id=?', [userId]);
    db.runSync('COMMIT');
  } catch (e) {
    db.runSync('ROLLBACK');
    throw e;
  }
}

export function listAllProgress(userId: string) {
  const flow = getActiveFlowRow(userId);
  if (!flow) return [];
  return db.getAllSync(
    'SELECT id, encuesta_id, status, started_at, completed_at, flow_id FROM questionnaire_progress WHERE user_id=? AND flow_id=? ORDER BY encuesta_id ASC',
    [userId, flow.id]
  ) as any[];
}

export function listReasonsForProgress(progressId: number) {
  return db.getAllSync('SELECT motivo_id FROM selected_reasons WHERE progress_id=?', [progressId]) as any[];
}

export function listIntensitiesForProgress(progressId: number) {
  return db.getAllSync(
    'SELECT motivo_id, intensidad_id, peso, answered_at FROM reason_intensities WHERE progress_id=? ORDER BY answered_at ASC',
    [progressId]
  ) as any[];
}

export function updateFlowStatus(userId: string, status: string) {
  const flow = getActiveFlowRow(userId);
  if (!flow) return null;
  db.runSync('UPDATE healing_flows SET status=?, updated_at=datetime("now") WHERE id=?', [status, flow.id]);
  return {...flow, status};
}

export function markFlowCompleted(flowId: number) {
  db.runSync('UPDATE healing_flows SET status=?, completed_at=datetime("now"), updated_at=datetime("now") WHERE id=?', ['completed', flowId]);
}

export function listFlowStages(userId: string) {
  const flow = getActiveFlowRow(userId);
  if (!flow) return [];
  return db.getAllSync(
    'SELECT id, encuesta_id, status, started_at, completed_at FROM questionnaire_progress WHERE user_id=? AND flow_id=? ORDER BY encuesta_id ASC',
    [userId, flow.id]
  ) as any[];
}

export function debugLogFlow(userId: string, label: string) {
  const flow = getActiveFlowRow(userId);
  const stages = flow ? db.getAllSync(
    'SELECT id, encuesta_id, status, started_at, completed_at FROM questionnaire_progress WHERE user_id=? AND flow_id=? ORDER BY encuesta_id ASC',
    [userId, flow.id]
  ) as any[] : [];
  console.log('[FLOW]', label, {
    flowId: flow?.id || null,
    flowStatus: flow?.status || null,
    stages: stages.map(s => ({
      id: s.id,
      encuesta: s.encuesta_id,
      status: s.status,
      started_at: s.started_at,
      completed_at: s.completed_at,
    })),
  });
}
