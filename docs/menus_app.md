# Menús de la app

## Objetivo

Documentar cómo está organizada hoy la navegación visible de menús en la app, separada en:

- menú de header
- menú lateral o principal
- menú de footer

Este documento describe el estado actual encontrado en código.

## 1. Menú de header

Componente base actual: `CMainAppBar`.

Referencias:

- `src/components/common/CMainAppBar.tsx`
- `src/modules/diagnostico/screens/DiagnosticoHomeScreen.tsx`

### Estructura actual en modo principal (`mode="main"`)

Orden visual actual:

1. Izquierda: botón de hamburguesa
2. Centro: logo
3. Derecha: teléfono, campana de notificaciones y perfil

### Elementos y comportamiento

- Hamburguesa
  - Ícono: `menu-outline`
  - Acción: abre el drawer global con `drawer.open()`
- Logo
  - Recurso: `assets/logo.png`
  - Acción: si hay sesión iniciada, navega a `Subscription`
- Teléfono
  - Ícono: `call-outline`
  - Acción: navega a `WellnessNetwork`
  - Interpretación funcional: acceso a la red del bienestar
- Campana
  - Ícono: `notifications-outline`
  - Acción: navega a `Notification`
  - Estado adicional: muestra badge rojo si hay notificaciones nuevas
- Perfil
  - Ícono: `person-circle-outline`
  - Acción:
    - con sesión: navega a `Profile`
    - sin sesión: reinicia navegación hacia `AuthNavigation`

### Nota importante

La descripción funcional que tenemos es "logo + teléfono + campana + perfil + hamburguesa", pero en la implementación actual el orden real es:

- hamburguesa a la izquierda
- logo centrado
- teléfono, campana y perfil a la derecha

## 2. Menú lateral o principal

Componente base actual: `DrawerMenu`.

Referencias:

- `src/navigation/DrawerMenu.js`
- `src/navigation/index.js`

### Cómo está montado

El drawer es un overlay custom global, no un drawer nativo de React Navigation.

- `DrawerProvider` envuelve toda la navegación
- `DrawerMenu` se renderiza junto a `StackNavigation`
- el botón hamburguesa del header lo abre

### Items actuales del drawer

En orden actual:

1. `¿Cómo te sientes hoy?`
   - navega a `TabNav.HomeTab`
2. `Diagnostico`
   - navega a `TabNav.HomeTab` con pantalla interna `DiagnosticoHome`
3. `Mis autoevaluaciones`
   - navega a `TabNav.EvaluationsTab`
4. `Tareas`
   - navega a `TabNav.CalenderTab`
5. `Sesiones terapeuticas`
   - navega a `TabNav.HomeTab` con pantalla interna `TherapyPendingSessions`
6. `Test`
   - navega a `TabNav.TestsTab`
7. `Mis resultados de tests`
   - navega a `StackNav.TestResultsHistory`
8. `Apoyo financiero`
   - navega a `StackNav.ApoyoFinanciero`
9. `Configuraciones`
   - navega a `StackNav.Configuration`
10. `Cerrar sesion` o `Iniciar sesion`
   - depende de si existe sesión activa

### Elementos visuales del drawer

- panel lateral con fondo verde `#0aa693`
- backdrop semitransparente para cerrar al tocar fuera
- logo al fondo del panel

## 3. Menú de footer

Componente base actual: `TabNavigation`.

Referencia:

- `src/navigation/types/TabNavigation.js`

### Tabs actuales

En orden actual:

1. `Home`
   - route: `TabNav.HomeTab`
   - componente: `HomeStack`
   - ícono: `home-outline`
2. `Tareas`
   - route: `TabNav.CalenderTab`
   - componente: `TasksScreen`
   - ícono: `calendar-outline`
3. `Mis autoevaluaciones`
   - route: `TabNav.EvaluationsTab`
   - componente: `DiagnosticoHistoryScreen`
   - ícono: `document-text-outline`
4. `Test`
   - route: `TabNav.TestsTab`
   - componente: `TestsListScreen`
   - ícono: `clipboard-outline`

### Comportamiento actual

- el footer no muestra header nativo de navegación
- se oculta con teclado abierto
- si `audioLocked` está activo, los botones del tab bar quedan deshabilitados visual y funcionalmente

## 4. Relación entre header, drawer y footer

- El header principal vive como componente reusable (`CMainAppBar`)
- El botón hamburguesa del header abre el menú lateral global (`DrawerMenu`)
- El footer es el `BottomTabNavigator`
- Varias opciones del drawer reutilizan tabs del footer
- Otras opciones del drawer navegan a pantallas stack fuera del footer

## 5. Rutas clave relacionadas

- `HomeTab` contiene `HomeStack`
- Dentro de `HomeStack` existe `DiagnosticoHome`
- `DiagnosticoHomeScreen` usa `CMainAppBar mode="main"`

Esto hace que el flujo de autoevaluación sea uno de los puntos principales donde hoy conviven:

- header principal
- menú hamburguesa
- navegación stack
- tabs del footer

## 6. Resumen corto

Hoy la app tiene tres piezas claras:

- Header principal con hamburguesa, logo y accesos rápidos a red del bienestar, notificaciones y perfil
- Menú lateral custom con accesos principales de la app
- Footer con 4 tabs: `Home`, `Tareas`, `Mis autoevaluaciones` y `Test`

## 7. Archivos fuente base

- `src/components/common/CMainAppBar.tsx`
- `src/navigation/DrawerMenu.js`
- `src/navigation/index.js`
- `src/navigation/types/TabNavigation.js`
- `src/modules/diagnostico/screens/DiagnosticoHomeScreen.tsx`
