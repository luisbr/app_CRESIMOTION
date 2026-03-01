# Flujo principal (Diagnostico + Terapia)

Este documento describe el flujo principal de pantallas y los endpoints que se consultan en cada paso.

## Diagnostico (se repite 3 veces)
Se ejecuta una vez por cada modulo:
- Motivos
- Sintomatologia fisica
- Sintomatologia emocional

### 1) DiagnosticoSelectionScreen
**Descripcion:** Seleccion de motivos o sintomas para evaluar.
**Endpoints:**
- `POST /api/v1/evaluations/sessions/start`
  - Se llama si no hay `sessionId` en los params.
  - Payload (ejemplo):
    ```json
    {
      "module_key": "motivos",
      "country_code": "MX",
      "group_id": 123
    }
    ```
  - Respuesta esperada (minimo):
    ```json
    {
      "session": { "id": 14, "group_id": 123 },
      "selection": { "selected_item_ids": [] },
      "answers": []
    }
    ```
- `POST /api/v1/evaluations/sessions/{id}/selection`
  - Guarda los ids seleccionados.
  - Payload (ejemplo):
    ```json
    { "selected_item_ids": [1, 5, 9] }
    ```

### 2) DiagnosticoWizardScreen
**Descripcion:** Valoracion de cada item seleccionado (intensidad u opciones especiales). Se responde item por item.
**Endpoints:**
- `POST /api/v1/evaluations/sessions/{id}/answers`
  - Guarda la respuesta de cada item.
  - Payload (intensidad estandar):
    ```json
    {
      "item_id": 10,
      "response_type": "intensidad_estandar",
      "intensity_key": "alto",
      "intensity_value": 3
    }
    ```
  - Payload (pensamiento extremo):
    ```json
    {
      "item_id": 99,
      "response_type": "pensamiento_extremo_planes",
      "special_value": "si"
    }
    ```
- `POST /api/v1/evaluations/sessions/{id}/complete`
  - Se llama al finalizar todos los items.

### 3) DiagnosticoResultsScreen
**Descripcion:** Muestra graficas de resultados (barras/pastel/radar) y resumen.
**Endpoints:**
- `GET /api/v1/evaluations/sessions/{id}/results`
  - Carga los resultados para graficar.
  - Respuesta esperada (estructura base):
    ```json
    {
      "groups": [
        {
          "key": "motivos",
          "items": [
            {
              "label": "Ansiedad",
              "intensity_label": "alto",
              "value": 3
            }
          ]
        }
      ],
      "risk": {
        "is_triggered": false,
        "message": ""
      }
    }
    ```

### 4) DiagnosticoHomeScreen
**Descripcion:** Pantalla de inicio/continuar autoevaluaciones.
**Endpoints (cuando aplica):**
- `GET /api/v1/evaluations/sessions/open`
  - Reanuda sesiones abiertas.
- `GET /api/v1/evaluations/history`
  - Historial (cuando se navega a Mis autoevaluaciones).

---

## Terapia

### 1) TherapyFocusSelect
**Descripcion:** Seleccion de enfoque/motivo para iniciar terapia.
**Endpoints:**
- `POST /api/app/sesion-terapeutica/focus/select`
  - Payload (ejemplo):
    ```json
    { "session_id": 14, "motivo_id": 1 }
    ```

### 2) TherapyHealingIntro
**Descripcion:** Introduccion a la sanacion emocional (checklist).
**Endpoints:**
- `POST /api/app/sesion-terapeutica/step/complete`
  - Avanza al siguiente paso.
  - Payload (ejemplo):
    ```json
    { "session_id": 14, "action": "START_HEALING" }
    ```

### 3) TherapyFocusContent
**Descripcion:** Reproduce audio de enfoque; al terminar se continua.
**Endpoints:**
- `POST /api/app/sesion-terapeutica/step/complete`
  - Payload (ejemplo):
    ```json
    { "session_id": 14, "action": "NEXT" }
    ```

### 4) TherapyHealingSelectEmotion
**Descripcion:** Seleccion de emocion (segun intensidades altas/medias).
**Endpoints:**
- `POST /api/app/sesion-terapeutica/healing/select`
  - Payload (ejemplo):
    ```json
    { "session_id": 14, "emocion_id": 1 }
    ```

### 5) TherapyHealingIntro (segunda vez)
**Descripcion:** Introduccion previa al playback de sanacion.
**Endpoints:**
- `POST /api/app/sesion-terapeutica/step/complete`
  - Payload (ejemplo):
    ```json
    { "session_id": 14, "action": "NEXT" }
    ```

### 6) TherapyHealingPlayback
**Descripcion:** Reproduce audio de sanacion; al finalizar cambia automaticamente.
**Endpoints:**
- `POST /api/app/sesion-terapeutica/playback/event`
  - Evento `FINISH` al terminar la reproduccion.
  - Payload (ejemplo):
    ```json
    { "session_id": 14, "event": "FINISH" }
    ```

### 7) TherapyBehaviorIntro
**Descripcion:** Evaluacion de la sesion terapeutica.
**Endpoints:**
- `POST /api/app/sesion-terapeutica/post-eval`
  - Envia valor 0-4 segun seleccion.
  - Payload (ejemplo):
    ```json
    { "session_id": 14, "emocion_id": 1, "value": 3 }
    ```
  - Respuesta esperada (ejemplo):
    ```json
    {
      "post_eval_message": {
        "emotion": "Tristeza",
        "baseline_value": 4,
        "current_value": 3,
        "reduced": true,
        "message_title": "¡Continúa trabajando en tu bienestar!",
        "message_body": "Tu emoción de Tristeza aún se encuentra en nivel Alto...",
        "recommendation_hours": 72,
        "recommendation_label": "72 horas"
      }
    }
    ```

### 8) TherapyBehaviorRecoSelect
**Descripcion:** Creacion de habitos saludables.
**Endpoints:**
- `POST /api/app/transformacion/recomendaciones`
  - Payload (ejemplo):
    ```json
    { "session_id": 14, "recomendacion_ids": [1, 3] }
    ```

### 9) TherapyBehaviorExerciseSelect
**Descripcion:** Seleccion de ejercicios.
**Endpoints:**
- `POST /api/app/transformacion/ejercicios`
  - Payload (ejemplo):
    ```json
    { "session_id": 14, "ejercicio_ids": [2, 4] }
    ```

### 10) TherapyAgendaSetup
**Descripcion:** Programacion de ejercicios para resolver algo.
**Endpoints:**
- `POST /api/app/sesion-terapeutica/agenda/submit`
  - Guarda agenda (via `submitAgendaItems`).
  - Payload (ejemplo):
    ```json
    {
      "session_id": 14,
      "items": [
        {
          "ejercicio_id": 2,
          "custom_title": "Respiracion",
          "frequency": "semanal",
          "times_per_day": 1,
          "days_of_week": ["mon", "wed"],
          "day_of_month": null,
          "time": "21:30",
          "duration_minutes": 10,
          "start_date": "2026-01-12",
          "end_date": "2026-02-12"
        }
      ]
    }
    ```

---

## Endpoints adicionales (usados en el flujo)
- `GET /api/app/sesion-terapeutica/next`
  - Determina siguiente paso en terapia.
- `GET /api/app/sesion-terapeutica/pendientes`
- `POST /api/app/sesion-terapeutica/pendientes/continuar`
- `POST /api/app/sesion-terapeutica/reset`
