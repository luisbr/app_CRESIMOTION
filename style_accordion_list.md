# Estilo — Lista acordeón para recomendaciones

Este patrón está pensado para listas largas con elementos expandibles (tipo acordeón), manteniendo legibilidad y acciones claras.

## 1) Encabezado de sección (fuera del contenedor)
- **Ubicación:** encima de la lista.
- **Fondo:** `colors.inputBg`.
- **Borde:** sin borde.
- **Sombra:** sutil para elevación.
- **Espaciado:** `padding: 12`, `marginBottom: 12`.

## 2) Contenedor principal (wrapper de la lista)
- **Un solo contenedor blanco** que agrupa todos los ítems.
- **Fondo:** `colors.white`.
- **Border radius:** 16.
- **Borde:** 1px con `colors.grayScale2`.
- **Sombra:** sutil (iOS `shadowOpacity ~0.12`, Android `elevation ~6`).
- **Padding:** el contenedor no lleva padding; el padding es interno por fila para que los separadores lleguen al borde.

## 3) Fila / ítem (acordeón)
### Estado cerrado
- **Layout:** `rowSpaceBetween`, `alignItems: center`.
- **Separador:** línea inferior `colors.grayScale2` (excepto en el último ítem).
- **Padding por fila:** `paddingVertical: 15`, `paddingHorizontal: 16`.

### Columna izquierda (info)
- **Título:** `S16`.
- **Badge de motivo:** debajo del título.
  - Fondo: `colors.inputBg`.
  - Texto: `colors.primary`.
  - `borderRadius: 12`, `paddingHorizontal: 10`, `paddingVertical: 4`.

### Columna derecha (acciones)
- **Checkbox:** togglear selección.
- **Chevron:** icono `chevron-down`, color `#999999`, con rotación 180° al expandir.
- **Interacción:** 
  - *Checkbox* solo marca/desmarca.
  - *Título / chevron* expande o colapsa.

## 4) Estado expandido
- **Animación:** `LayoutAnimation` suave.
- **Descripción:** aparece debajo del badge.
  - `paddingTop`/`paddingBottom` extra (ej. `paddingBottom: 14`).
  - Color `#666666`, `lineHeight: 18`.

## 5) Comportamiento y UX
- **Listas largas:** usar `FlatList` y `ListFooterComponent` para espacio extra.
- **Espacio inferior:** dejar un footer extra para evitar que el botón fijo tape el último ítem.

## 6) Referencia de implementación
- `src/screens/therapy/BehaviorRecoSelectScreen.tsx`
