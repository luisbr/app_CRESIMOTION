const ACTIVE_FLOW_STATES = ['collecting', 'ready_for_healing', 'healing'];
const READY_STAGE_STATUS = 'ready';

type FlowRow = {
  id: number;
  user_id: string;
  status: string;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
};

type ProgressRow = {
  id: number;
  encuesta_id: string;
  user_id: string;
  status: string;
  flow_id: number | null;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
};

type SelectedReasonRow = {
  id: number;
  progress_id: number;
  motivo_id: string;
  selected: number;
};

type ReasonIntensityRow = {
  id: number;
  progress_id: number;
  motivo_id: string;
  intensidad_id: string;
  peso: number;
  answered_at: string;
};

const now = () => new Date().toISOString();

const flows: FlowRow[] = [];
const progresses: ProgressRow[] = [];
const selectedReasons: SelectedReasonRow[] = [];
const reasonIntensities: ReasonIntensityRow[] = [];

let flowIdCounter = 1;
let progressIdCounter = 1;
let selectedReasonIdCounter = 1;
let intensityIdCounter = 1;

const log = (label: string, payload?: any) => {
  console.log('[FORMS][WEB]', label, payload || '');
};

const getActiveFlowRow = (userId: string): FlowRow | null => {
  const candidates = flows
    .filter(flow => flow.user_id === userId && ACTIVE_FLOW_STATES.includes(flow.status))
    .sort((a, b) => (b.started_at > a.started_at ? 1 : b.started_at < a.started_at ? -1 : 0));
  return candidates.length ? { ...candidates[0] } : null;
};

const createFlowRow = (userId: string): FlowRow => {
  const timestamp = now();
  const flow: FlowRow = {
    id: flowIdCounter++,
    user_id: userId,
    status: 'collecting',
    started_at: timestamp,
    updated_at: timestamp,
    completed_at: null,
  };
  flows.push(flow);
  return { ...flow };
};

export function getActiveFlow(userId: string): FlowRow | null {
  return getActiveFlowRow(userId);
}

export function ensureActiveFlow(userId: string): FlowRow {
  return getActiveFlowRow(userId) || createFlowRow(userId);
}

const attachLegacyProgressToFlow = (userId: string, encuestaId: string, flowId: number) => {
  const legacy = progresses.find(
    progress =>
      progress.user_id === userId &&
      progress.encuesta_id === encuestaId &&
      (!progress.flow_id || progress.flow_id === 0)
  );
  if (!legacy) return null;
  legacy.flow_id = flowId;
  legacy.updated_at = now();
  return { ...legacy, flow_id: flowId };
};

export function startOrGetProgress(userId: string, encuestaId: string) {
  const flow = ensureActiveFlow(userId);
  if (flow.status === 'healing') {
    throw new Error('El flujo de sanación está en curso. No se pueden editar las encuestas.');
  }
  let row = progresses.find(
    progress => progress.user_id === userId && progress.encuesta_id === encuestaId && progress.flow_id === flow.id
  );
  if (!row) {
    row = attachLegacyProgressToFlow(userId, encuestaId, flow.id);
  }
  if (row) {
    if (row.status === 'pending') {
      row.status = 'in_progress';
      row.started_at = now();
      row.updated_at = now();
    }
    log('startOrGetProgress', { userId, encuestaId, created: false, progressId: row.id, flowId: flow.id });
    return { ...row };
  }
  const timestamp = now();
  const created: ProgressRow = {
    id: progressIdCounter++,
    encuesta_id: encuestaId,
    user_id: userId,
    status: 'in_progress',
    flow_id: flow.id,
    started_at: timestamp,
    updated_at: timestamp,
    completed_at: null,
  };
  progresses.push(created);
  log('startOrGetProgress', { userId, encuestaId, created: true, progressId: created.id, flowId: flow.id });
  return { ...created };
}

export function completeProgress(progressId: number) {
  const row = progresses.find(p => p.id === progressId);
  if (!row) return;
  row.status = READY_STAGE_STATUS;
  row.completed_at = now();
  row.updated_at = now();
}

export function updateProgressStatus(progressId: number, status: string) {
  const row = progresses.find(p => p.id === progressId);
  if (!row) return;
  row.status = status;
  row.updated_at = now();
}

export function saveSelectedReasons(progressId: number, motivoIds: string[]) {
  log('saveSelectedReasons CLEAR', { progressId });
  for (let i = selectedReasons.length - 1; i >= 0; i -= 1) {
    if (selectedReasons[i].progress_id === progressId) {
      selectedReasons.splice(i, 1);
    }
  }
  const uniqueIds = new Set<string>();
  motivoIds.forEach(m => uniqueIds.add(m));
  uniqueIds.forEach(m => {
    selectedReasons.push({
      id: selectedReasonIdCounter++,
      progress_id: progressId,
      motivo_id: m,
      selected: 1,
    });
  });
  log('saveSelectedReasons INSERT', { progressId, count: uniqueIds.size });
}

export function listSelectedReasons(progressId: number): string[] {
  const rows = selectedReasons.filter(r => r.progress_id === progressId);
  log('listSelectedReasons', { progressId, count: rows.length });
  return rows.map(r => String(r.motivo_id));
}

export function saveIntensity(progressId: number, motivoId: string, intensidadId: string, peso: number) {
  let row = reasonIntensities.find(r => r.progress_id === progressId && r.motivo_id === motivoId);
  if (!row) {
    row = {
      id: intensityIdCounter++,
      progress_id: progressId,
      motivo_id: motivoId,
      intensidad_id: intensidadId,
      peso,
      answered_at: now(),
    };
    reasonIntensities.push(row);
  } else {
    row.intensidad_id = intensidadId;
    row.peso = peso;
    row.answered_at = now();
  }
  log('upsert reason_intensity', { progressId, motivoId, intensidadId, peso });
}

export function getAnsweredMotivoIds(progressId: number): string[] {
  return reasonIntensities.filter(r => r.progress_id === progressId).map(r => String(r.motivo_id));
}

export function getSummary(progressId: number) {
  return reasonIntensities
    .filter(r => r.progress_id === progressId)
    .map(r => ({
      motivo_id: r.motivo_id,
      intensidad_id: r.intensidad_id,
      peso: r.peso,
    }));
}

export function getInProgressForUser(userId: string) {
  const flow = getActiveFlowRow(userId);
  if (!flow) return null;
  const row = progresses
    .filter(
      progress =>
        progress.user_id === userId && progress.flow_id === flow.id && progress.status === 'in_progress'
    )
    .sort((a, b) => (b.started_at > a.started_at ? 1 : b.started_at < a.started_at ? -1 : 0))[0];
  log('getInProgressForUser', { userId, found: !!row, encuestaId: row?.encuesta_id, progressId: row?.id, flowId: flow.id });
  return row ? { ...row } : null;
}

export function listUnansweredMotivoIds(progressId: number, motivoIds: string[]): string[] {
  if (!motivoIds?.length) return [];
  const answered = new Set(reasonIntensities.filter(r => r.progress_id === progressId).map(r => String(r.motivo_id)));
  const result = motivoIds.filter(id => !answered.has(String(id)));
  log('listUnanswered', { progressId, selected: motivoIds.length, answered: answered.size, result: result.length });
  return result;
}

export function hasCompleted(userId: string, encuestaId: string) {
  const flow = getActiveFlowRow(userId);
  if (!flow) return false;
  const row = progresses.find(
    progress =>
      progress.user_id === userId &&
      progress.encuesta_id === encuestaId &&
      progress.flow_id === flow.id &&
      progress.status === READY_STAGE_STATUS
  );
  return !!row;
}

export function closeOtherInProgressForSameSurvey(userId: string, encuestaId: string, keepProgressId: number) {
  const flow = getActiveFlowRow(userId);
  if (!flow) return;
  progresses.forEach(progress => {
    if (
      progress.user_id === userId &&
      progress.encuesta_id === encuestaId &&
      progress.flow_id === flow.id &&
      progress.status === 'in_progress' &&
      progress.id !== keepProgressId
    ) {
      progress.status = READY_STAGE_STATUS;
      progress.completed_at = now();
      progress.updated_at = now();
      log('closed stale in_progress', { survey: encuestaId, progressId: progress.id, flowId: flow.id });
    }
  });
}

export function clearAllProgressForUser(userId: string) {
  const toRemove = progresses.filter(p => p.user_id === userId);
  const ids = toRemove.map(p => p.id);
  for (const id of ids) {
    for (let i = selectedReasons.length - 1; i >= 0; i -= 1) {
      if (selectedReasons[i].progress_id === id) {
        selectedReasons.splice(i, 1);
      }
    }
    for (let i = reasonIntensities.length - 1; i >= 0; i -= 1) {
      if (reasonIntensities[i].progress_id === id) {
        reasonIntensities.splice(i, 1);
      }
    }
  }
  for (let i = progresses.length - 1; i >= 0; i -= 1) {
    if (progresses[i].user_id === userId) {
      progresses.splice(i, 1);
    }
  }
  for (let i = flows.length - 1; i >= 0; i -= 1) {
    if (flows[i].user_id === userId) {
      flows.splice(i, 1);
    }
  }
}

export function listAllProgress(userId: string) {
  const flow = getActiveFlowRow(userId);
  if (!flow) return [];
  return progresses
    .filter(progress => progress.user_id === userId && progress.flow_id === flow.id)
    .map(progress => ({ ...progress }));
}

export function listReasonsForProgress(progressId: number) {
  return listSelectedReasons(progressId);
}

export function listIntensitiesForProgress(progressId: number) {
  return reasonIntensities
    .filter(row => row.progress_id === progressId)
    .sort((a, b) => (b.answered_at > a.answered_at ? 1 : b.answered_at < a.answered_at ? -1 : 0))
    .map(row => ({
      motivo_id: row.motivo_id,
      intensidad_id: row.intensidad_id,
      peso: row.peso,
      answered_at: row.answered_at,
    }));
}

export function updateFlowStatus(userId: string, status: string) {
  const flow = getActiveFlowRow(userId);
  if (!flow) return null;
  flow.status = status;
  flow.updated_at = now();
  return { ...flow };
}

export function markFlowCompleted(flowId: number) {
  const flow = flows.find(f => f.id === flowId);
  if (!flow) return;
  flow.status = 'completed';
  flow.completed_at = now();
  flow.updated_at = now();
}

export function listFlowStages(userId: string) {
  const flow = getActiveFlowRow(userId);
  if (!flow) return [];
  return progresses
    .filter(progress => progress.user_id === userId && progress.flow_id === flow.id)
    .map(progress => ({ ...progress }));
}

export function debugLogFlow(userId: string, label: string) {
  const flow = getActiveFlowRow(userId);
  const stages = flow
    ? progresses
        .filter(progress => progress.user_id === userId && progress.flow_id === flow.id)
        .map(stage => ({
          id: stage.id,
          encuesta: stage.encuesta_id,
          status: stage.status,
          started_at: stage.started_at,
          completed_at: stage.completed_at,
        }))
    : [];
  console.log('[FLOW][WEB]', label, {
    flowId: flow?.id || null,
    flowStatus: flow?.status || null,
    stages,
  });
}
