# CODEX — RN App: Diagnóstico V1 HOY (WS catálogos públicos + V1 sesiones con Bearer)
Contexto:
- Login ya funciona.
- /api/ws/diagnostico/* HOY son GET públicos (sin auth).
- /api/v1/evaluations/* usa Authorization Bearer + X-Device-UUID.

Objetivo HOY:
Motivos → Física → Emocional
cada módulo: Selección → Wizard evaluación → Completar → Resultados
+ Mis evaluaciones (history + detalle results)

---

## 1) APIs a usar

### 1.1 Catálogos (públicos, sin auth)
- GET /api/ws/diagnostico/motivos
- GET /api/ws/diagnostico/sintomas-fisicos
- GET /api/ws/diagnostico/sintomas-emocionales

Usarlos SOLO para pintar selección y opciones.

### 1.2 Sesiones (progreso/resultados) — protegidos
Base: /api/v1
Headers obligatorios:
- Authorization: Bearer <token>
- X-Device-UUID: <uuid>

Endpoints:
- POST /evaluations/sessions/start  { module_key, country_code }
- POST /evaluations/sessions/{id}/selection { selected_item_ids }
- POST /evaluations/sessions/{id}/answers   { item_id, response_type, intensity_* | special_value }
- POST /evaluations/sessions/{id}/complete  {}
- GET  /evaluations/sessions/{id}/results
- GET  /evaluations/history?module_key=...&limit=...&offset=...

module_key:
- motivos
- sintomas_fisicos
- sintomas_emocionales

---

## 2) Implementación RN (rápida)

### 2.1 Crear módulo
src/modules/diagnostico/
  api/
    wsCatalogApi.ts        // GET públicos /api/ws/diagnostico/*
    sessionsApi.ts         // /api/v1/evaluations/* con Bearer
  screens/
    DiagnosticoHomeScreen.tsx
    DiagnosticoSelectionScreen.tsx
    DiagnosticoWizardScreen.tsx
    DiagnosticoResultsScreen.tsx
    DiagnosticoHistoryScreen.tsx
    DiagnosticoHistoryDetailScreen.tsx
    SupportResourcesScreen.tsx
  components/
    ChecklistItem.tsx
    OptionCard.tsx
    ProgressBar.tsx
  types.ts
  utils.ts

### 2.2 Device UUID
- Si no existe uuid persistido:
  - generar una vez (uuid v4)
  - guardar en AsyncStorage con key: device_uuid
- Enviar SIEMPRE X-Device-UUID en sesionesApi.

---

## 3) wsCatalogApi.ts (público)
Funciones:
- getMotivosCatalog()
- getSintomasFisicosCatalog()
- getSintomasEmocionalesCatalog()

Normalizar a:
Item = {
  id: number,
  key?: string,
  titulo: string,
  descripcion?: string|null,
  orden?: number,
  response_type?: string,
  options?: Array<{ key: string, label: string, value?: any, order?: number }>
}

Mapeo rápido:
- motivos:
  - response_type = 'intensidad_estandar'
- sintomas-fisicos:
  - si trae options usar
  - si no trae, tratar como 'intensidad_estandar' V1
- sintomas-emocionales:
  - usar response_type del backend
  - si response_type es pensamiento_extremo_*: options debe venir del backend

---

## 4) sessionsApi.ts (Bearer)
Implementar:
- startSession(moduleKey, countryCode) -> {session, selection, answers}
- saveSelection(sessionId, selectedIds) -> {ok:true}
- saveAnswer(sessionId, payload) -> {ok:true}
- completeSession(sessionId) -> {ok:true, completed_at, risk?}
- getResults(sessionId) -> {session, groups, risk}
- getHistory(moduleKey, limit, offset) -> {items:[]}

Validación en app (mínima):
- intensidad_estandar: enviar intensity_value + intensity_key
- pensamiento_extremo_*: enviar special_value

---

## 5) Pantallas (V1)

### 5.1 DiagnosticoHomeScreen
- Botón “Iniciar diagnóstico” -> Selection motivos
- Botón “Mis evaluaciones” -> History

### 5.2 DiagnosticoSelectionScreen (genérica)
Params: module_key
Steps:
1) sessionsApi.startSession(module_key,'MX') => session, selection, answers
2) wsCatalogApi.getCatalog(module_key) => items ordenados
3) UI checklist con selección pre-marcada por `selection`
4) Botón “Siguiente”:
   - sessionsApi.saveSelection(session.id, selectedIds)
   - navegar a Wizard

### 5.3 DiagnosticoWizardScreen (genérica)
Input:
- sessionId, module_key
- selection + answers (del start)
- items catalog (del ws)

Lógica:
- currentItem = primer seleccionado sin respuesta
- options:
  - intensidad_estandar: hardcode 5:
    - {key:'nulo',label:'Nulo',value:0}
    - {key:'bajo',label:'Bajo',value:1}
    - {key:'medio',label:'Medio',value:2}
    - {key:'alto',label:'Alto',value:3}
    - {key:'muy_alto',label:'Muy alto',value:4}
  - pensamiento_extremo_*: usar item.options
- al elegir opción -> sessionsApi.saveAnswer(...)
- “Siguiente” avanza al siguiente no contestado
- “Completar”:
  - sessionsApi.completeSession(sessionId)
  - navegar a Results

### 5.4 DiagnosticoResultsScreen
- sessionsApi.getResults(sessionId)
- render groups simple (listas)
- si risk.is_triggered: Alert + botón “Ver vías de apoyo” -> SupportResourcesScreen
- CTA:
  - motivos -> Selection sintomas_fisicos
  - fisicos -> Selection sintomas_emocionales
  - emocionales -> fin (volver Home)

### 5.5 History + Detail
- History: selector módulo + sessionsApi.getHistory(...)
- Detail: sessionsApi.getResults(sessionId) y render como Results

### 5.6 SupportResourcesScreen
Placeholder V1.

---

## 6) Done hoy
- [ ] Completo los 3 módulos end-to-end y se guardan como sesiones completed
- [ ] Puedo cerrar app a mitad y reanuda por /start
- [ ] Puedo ver historial y detalle
- [ ] Riesgo en emocional muestra alerta y pantalla placeholder

---

## 7) Nota (seguridad backlog)
WS catálogos hoy son públicos. NO bloquear V1.
Backlog próximo sprint:
- proteger /api/ws/diagnostico/* con Bearer o token legacy
- agregar rate-limit + cache en server



## (NUEVO) Reanudar flujo automáticamente (local + backend)

### Objetivo UX
- En DiagnosticoHomeScreen:
  - Si el usuario tiene una sesión abierta, mostrar “Continuar diagnóstico” y enviarlo a donde se quedó.
  - Si no, mostrar “Iniciar diagnóstico”.

### Backend recomendado (mínimo, evita sesiones fantasma)
Implementar endpoint:
- GET /api/v1/evaluations/sessions/open
Response:
{ "open_session": { "id": 123, "module_key": "sintomas_fisicos", "status": "in_progress" } }
o { "open_session": null }

### Local storage (AsyncStorage)
Key: diagnostico_last_route
Value ejemplo:
{
  "session_id": 123,
  "module_key": "sintomas_fisicos",
  "screen": "Wizard"
}

Reglas de guardado:
- Al terminar saveSelection -> set screen="Wizard"
- Al completeSession -> set screen="Results"
- Al finalizar Emocional (y salir del diagnóstico) -> borrar key

### Lógica en DiagnosticoHomeScreen (onFocus)
1) Leer diagnostico_last_route
2) Llamar GET /sessions/open
3) Si open_session existe:
   - Si local.session_id == open_session.id:
       navegar a local.screen con params (module_key, sessionId)
   - Si no coincide o no hay local:
       navegar por default a Selection del open_session.module_key (o Wizard si ya hay selection)
4) Si open_session == null:
   - borrar diagnostico_last_route si existe
   - mostrar botón “Iniciar diagnóstico” -> Selection motivos

NOTA: Si no se puede crear el endpoint open HOY:
- fallback: guardar siempre local.session_id al crear/reanudar en /start, y navegar usando ese.
- pero evitar llamar /start solo para “detectar” porque crea sesiones nuevas.
