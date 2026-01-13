# Contexto actual — app_CRESIMOTION

## Objetivo general
Nuevo flujo de diagnóstico (motivos → síntomas físicos → síntomas emocionales) con sesiones agrupadas por `group_id`, historial y gráficas, más behaviors en síntomas físicos.

## Cambios clave hechos
- Nuevo módulo en `src/modules/diagnostico/`:
  - `api/wsCatalogApi.ts`, `api/sessionsApi.ts`
  - `screens/*` (Home, Selection, Wizard, Results, History, HistoryDetail, SupportResources)
  - `components/*` (ChecklistItem, OptionCard, ProgressBar, BehaviorMessageCard)
  - `types.ts`, `utils.ts`
- Backup de flujo viejo: `src/screens/forms_bkp/`
- HomeTab ahora navega a `DiagnosticoHome`.
- Barra de estado global verde:
  - `src/index.js` → `StatusBar` con `backgroundColor: #0aa693` + `light-content`.

## Sesiones agrupadas (group_id)
- `startSession` acepta `group_id` en `src/modules/diagnostico/api/sessionsApi.ts`.
- `utils.ts` guarda/lee `diagnostico_group_id`.
- `DiagnosticoSelectionScreen` usa `group_id` cuando no es motivos.
- `DiagnosticoResultsScreen` limpia `group_id` al finalizar emocionales.
- Historial agrupa por `group_id` (`DiagnosticoHistoryScreen`).

## GET /sessions/open
- Nuevo endpoint soportado en `DiagnosticoHomeScreen` para retomar sesión abierta:
  - Si hay sesiones abiertas, muestra “Continuar diagnóstico” y navega a Selection con `sessionId/selection/answers`.
- `DiagnosticoSelectionScreen` acepta preloaded params (`sessionId`, `selection`, `answers`) y no crea sesión nueva.

## Behavior messages
- Se muestran debajo de opciones si:
  - `behavior.active === true`
  - `behavior.show_text_below === true`
  - match por `option_id` (prioridad) o `option_key`.
- Componente: `BehaviorMessageCard`
- Estilos `text_style` (warning/info/info_blue/success/danger).
- Fallback icono: si `icon_key` vacío y `text_style=info_blue`, usa `images.SerenityIcon` (agregar en assets).
- Card con animación y `accessibilityRole="alert"`.

## Gráficas en resultados
- Bar / Pie / Radar con selector.
- Persistencia de vista en `diagnostico_chart_view`.
- Radar usa bolitas coloreadas por motivo.
- Resultados ahora muestran chart con leyenda; estilo similar a mock.

## Historial
- Historial ya no filtra por `module_key`.
- Lista solo “Sesión #X” y fecha local.
- Detalle permite navegar entre módulos con “Anterior / Siguiente” y título con nombre de módulo.

## Menú lateral global
- Drawer custom global con opciones:
  - Diagnostico, Mis evaluaciones, Perfil, Cerrar/Iniciar sesión.
- Fondo verde `#0aa693`, texto blanco, logo al final.
- Contexto: `src/navigation/DrawerContext.js`
- Drawer render en `src/navigation/types/TabNavigation.js`
- Hamburguesa en `DiagnosticoHomeScreen` abre el drawer.

## Pendiente / to-do
- Agregar asset `serenity-1768253110851.png` en `src/assets/images/` y exportar en `src/assets/images/index.js` como `SerenityIcon`.
- Si se quiere: menú hamburguesa en más pantallas (extender `CHeader` o incluir el botón).

## Archivos tocados frecuentemente
- `src/modules/diagnostico/screens/*`
- `src/modules/diagnostico/api/*`
- `src/modules/diagnostico/utils.ts`
- `src/modules/diagnostico/components/BehaviorMessageCard.tsx`
- `src/navigation/types/TabNavigation.js`
- `src/navigation/DrawerContext.js`
- `src/index.js`
