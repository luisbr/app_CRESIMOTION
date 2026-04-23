# Scrollbar Custom Siempre Visible

Este documento describe el patron usado en [DiagnosticoSelectionScreen](/Users/osx/Documents/LBR/app_CRESIMOTION/src/modules/diagnostico/screens/DiagnosticoSelectionScreen.tsx) para mostrar un scrollbar visual siempre visible, pensado para pantallas donde el scroll nativo no se percibe bien.

## Cuándo usarlo

Usarlo solo en pantallas donde:

- hay mucho contenido vertical
- el usuario puede no detectar facilmente que existe scroll
- el indicador nativo de iOS/Android no es suficientemente visible
- el contenido tiene bloques grandes y el final de pantalla parece "cerrado"

Ejemplos candidatos:

- listas largas de seleccion
- pantallas de diagnostico
- formularios largos
- pantallas informativas para usuarios mayores

No usarlo por defecto en toda la app. Primero validar que la pantalla realmente tenga un problema de descubribilidad del scroll.

## Idea general

En vez de depender de `showsVerticalScrollIndicator`, se pinta una barra visual propia:

- track fijo a la derecha
- thumb visible todo el tiempo
- el thumb se mueve segun la posicion del scroll
- el track solo aparece cuando el contenido es mas alto que el viewport

Ademas, se deja un `paddingRight` en el contenido para que la barra no se monte encima de las tarjetas o texto.

## Estructura base

1. Estado para el scrollbar:

```tsx
const [scrollIndicator, setScrollIndicator] = useState({
  visible: false,
  top: 0,
  height: 0,
});
```

2. Refs para medir viewport y contenido:

```tsx
const scrollLayoutHeightRef = useRef(0);
const scrollContentHeightRef = useRef(0);
```

3. Funcion que calcula el thumb:

```tsx
const updateScrollIndicator = (scrollY = 0) => {
  const layoutHeight = scrollLayoutHeightRef.current;
  const contentHeight = scrollContentHeightRef.current;

  if (!layoutHeight || !contentHeight || contentHeight <= layoutHeight + 4) {
    setScrollIndicator({visible: false, top: 0, height: 0});
    return;
  }

  const trackHeight = Math.max(layoutHeight - moderateScale(8), 1);
  const thumbHeight = Math.max(
    (layoutHeight / contentHeight) * trackHeight,
    moderateScale(36)
  );
  const maxScroll = Math.max(contentHeight - layoutHeight, 1);
  const maxThumbTop = Math.max(trackHeight - thumbHeight, 0);
  const thumbTop = (scrollY / maxScroll) * maxThumbTop;

  setScrollIndicator({
    visible: true,
    top: thumbTop,
    height: thumbHeight,
  });
};
```

4. `ScrollView` con mediciones:

```tsx
<ScrollView
  style={{flex: 1}}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{
    paddingBottom: 140,
    paddingRight: moderateScale(18),
  }}
  onLayout={event => {
    scrollLayoutHeightRef.current = event.nativeEvent.layout.height;
    updateScrollIndicator();
  }}
  onContentSizeChange={(_, height) => {
    scrollContentHeightRef.current = height;
    updateScrollIndicator();
  }}
  onScroll={event => {
    updateScrollIndicator(event.nativeEvent.contentOffset.y);
  }}
  scrollEventThrottle={16}
>
  {/** contenido */}
</ScrollView>
```

5. Pintar el indicador custom encima del area:

```tsx
{scrollIndicator.visible && (
  <View pointerEvents="none" style={localStyles.scrollIndicatorTrack}>
    <View
      style={[
        localStyles.scrollIndicatorThumb,
        {
          top: scrollIndicator.top,
          height: scrollIndicator.height,
          backgroundColor: colors.primary,
        },
      ]}
    />
  </View>
)}
```

## Estilos base

```tsx
scrollIndicatorTrack: {
  position: 'absolute',
  top: moderateScale(4),
  bottom: moderateScale(4),
  right: moderateScale(4),
  width: moderateScale(8),
  borderRadius: moderateScale(4),
  backgroundColor: 'rgba(0, 0, 0, 0.08)',
},
scrollIndicatorThumb: {
  position: 'absolute',
  left: 0,
  right: 0,
  borderRadius: moderateScale(4),
},
```

## Reglas de uso

- Siempre dejar `showsVerticalScrollIndicator={false}` cuando uses el custom, para no duplicar barras.
- Siempre agregar `paddingRight` al `contentContainerStyle`, para que el scrollbar no tape contenido.
- El `thumbHeight` debe tener un minimo visible. Hoy usamos `moderateScale(36)`.
- El color del thumb debe contrastar bien con el fondo.
- El track debe ser discreto, pero visible.
- `pointerEvents="none"` evita que el scrollbar bloquee toques sobre el contenido.

## Recomendaciones visuales

Para usuarios mayores:

- preferir thumb mas grueso que el nativo
- usar contraste claro
- no hacerlo demasiado transparente
- mantenerlo visible siempre si la pantalla tiene overflow

Valores recomendados:

- ancho track: `8` a `10`
- radio: `4` a `5`
- altura minima thumb: `36` a `48`

## Dónde ya esta aplicado

- [DiagnosticoSelectionScreen](/Users/osx/Documents/LBR/app_CRESIMOTION/src/modules/diagnostico/screens/DiagnosticoSelectionScreen.tsx)

## Siguiente paso sugerido

Si este patron se empieza a repetir, conviene extraerlo a un wrapper reusable, por ejemplo:

- `CScrollIndicator`
- `CScrollViewWithIndicator`

Eso permitiria:

- centralizar la logica
- ajustar accesibilidad en un solo lugar
- evitar duplicacion de estado, refs y estilos
