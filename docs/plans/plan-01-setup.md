# Plan 01: Setup del Proyecto

## Objetivo

Dejar el proyecto Vue 3 + TypeScript + Vite listo con:

1. Quasar instalado y **configurado** (plugin Vite, estilos, iconos, plugins `Dialog`/`Notify`, auto-import de componentes UI).
2. Vue Router con **estructura de rutas + guard base** (`meta.requiresAuth`).
3. Alias, CSS parametrizado y carpetas de arquitectura.

Sin librerías de UI, validación o estado ajenas al stack de la prueba.

## Dependencias

- Scaffold: Vue 3, TypeScript, Vite, Pinia, Vue Router, Vitest
- Node `^22.18` (`nvm use 22`)
- Rama: `feature/prueba-tecnica`

## Documentación de referencia

- [OVERVIEW.md](../OVERVIEW.md) — stack: `QTable`, `QForm`, `QInput`, `QSelect`, `QToggle`, `QDialog`, `Notify`
- [Skill: Crear componentes Vue](../skills/create-vue-component/SKILL.md)

## Reglas clave

- No recrear con `npm init quasar`. Se integra Quasar sobre Vite + TS.
- Quasar debe quedar usable de inmediato: componentes del overview disponibles vía auto-import del vite-plugin.
- Plugins obligatorios desde el setup: `Notify` (errores) y `Dialog` (confirmaciones).
- El **guard de rutas** se crea en este plan (esqueleto + `beforeEach`). El plan 02 solo lo conecta a la sesión real de Pinia.
- No instalar Axios, VeeValidate, Zod, SweetAlert ni Tailwind.
- Estilos parametrizados en `src/css/variables.css` y `src/css/quasar-variables.sass`.

## Tareas

### 1.1 Instalar dependencias de Quasar

```bash
nvm use 22
npm install quasar @quasar/extras
npm install -D @quasar/vite-plugin sass-embedded@^1.93.2
```

| Paquete | Rol |
|---------|-----|
| `quasar` | UI + plugins (`Notify`, `Dialog`) |
| `@quasar/extras` | Material Icons |
| `@quasar/vite-plugin` | Auto-import / tree-shake de `Q*` |
| `sass-embedded` | Estilos Quasar (≥ 2.14) |

### 1.2 Configurar Quasar (componentes listos)

Esto **no** es solo `npm install`. Hay que dejar Quasar operativo para los componentes del overview:

| Componente / plugin | Uso en la prueba |
|---------------------|------------------|
| `QForm`, `QInput`, `QSelect` | Login, filtros, formulario de pago |
| `QTable`, `QToggle` | Listado y estado activo/inactivo |
| `QBtn`, `QCard`, `QLayout`, `QHeader`, `QToolbar` | Layout y acciones |
| `Dialog` | Confirmación al eliminar |
| `Notify` | Errores globales desde el store |

Pasos:

1. `vite.config.ts`: plugin `quasar({ sassVariables })` + `transformAssetUrls` en `@vitejs/plugin-vue`.
2. `src/config/quasar.ts`: configuración central (plugins, `iconSet` Material, brand/tokens si aplica).
3. `src/main.ts`: importar CSS de Quasar + extras, `app.use(Quasar, quasarOptions)`.
4. `src/css/quasar-variables.sass` + `src/css/variables.css` + `src/css/app.css`.

Con el vite-plugin, los `Q*` se auto-importan al usarlos en templates. No hace falta registrar cada uno a mano; sí hace falta el plugin + `main` + CSS + plugins `Dialog`/`Notify`.

### 1.3 Router base + guard (obligatorio en este plan)

Crear la infraestructura de navegación **antes** del login UI:

```
src/router/
├── index.ts      # createRouter + beforeEach(authGuard)
├── routes.ts     # /login pública, / protegida (meta.requiresAuth)
├── guards.ts     # authGuard
└── guards.spec.ts
```

Comportamiento del guard en setup:

- Lee `to.meta.requiresAuth`.
- Si requiere auth y **no** hay sesión → `next({ name: 'login' })`.
- Si va a `login` y **sí** hay sesión → `next({ name: 'payments' })` (o home).
- En este plan la sesión puede leerse de un store auth mínimo o stub tipado; el plan 02 completa login/logout real.
- Tipar `RouteMeta.requiresAuth` en `env.d.ts`.

### 1.4 Alias de importación

| Alias | Destino |
|-------|---------|
| `@/` | `src/` |
| `@components` | `src/components` |
| `@pages` | `src/pages` |
| `@stores` | `src/stores` |
| `@mocks` | `src/mocks` |
| `@router` | `src/router` |
| `@app-types` | `src/types` |
| `@utils` | `src/utils` |
| `@layouts` | `src/layouts` |
| `@config` | `src/config` |

### 1.5 Estructura de carpetas

```
src/
├── config/       # quasar.ts y configs de app
├── css/          # variables + app.css
├── types/
├── mocks/data/
├── utils/
├── stores/
├── components/
├── pages/
├── layouts/
└── router/       # routes + guards (este plan)
```

### 1.6 Verificación

```bash
nvm use 22
npm run type-check
npm run test:unit -- --run
npm run dev
```

Comprobar que un SFC puede renderizar al menos `QBtn` / `QInput` sin import manual, y que el guard tiene specs.

## Archivos a crear / tocar

| Archivo | Descripción |
|---------|-------------|
| `package.json` | Dependencias Quasar |
| `vite.config.ts` | Plugin Quasar + alias |
| `src/config/quasar.ts` | Options: plugins, iconSet |
| `src/main.ts` | `app.use(Quasar, …)` |
| `src/css/*` | Tokens y estilos base |
| `src/router/routes.ts` | Rutas con `meta.requiresAuth` |
| `src/router/guards.ts` + spec | Guard de autenticación |
| `src/router/index.ts` | `beforeEach(authGuard)` |
| `env.d.ts` | `RouteMeta.requiresAuth` |

## Criterios de aceptación

- [ ] Quasar + extras + vite-plugin + sass-embedded instalados
- [ ] Sin Axios / VeeValidate / SweetAlert / Tailwind
- [ ] `src/config/quasar.ts` registra `Dialog` y `Notify` + iconSet Material
- [ ] Vite plugin Quasar activo (auto-import de componentes `Q*`)
- [ ] Se pueden usar en template: `QForm`, `QInput`, `QSelect`, `QTable`, `QToggle`, `QBtn`, `QDialog` (vía plugin)
- [ ] CSS Quasar + tokens `--app-*` cargados
- [ ] Rutas definidas con `meta.requiresAuth`
- [ ] `router.beforeEach(authGuard)` registrado
- [ ] Specs del guard pasan (protegida sin sesión → login)
- [ ] Alias configurados (incluye `@config`)
- [ ] `type-check` y `test:unit -- --run` pasan
- [ ] Commit sugerido: `chore: configure quasar components and route guards`

## Notas

- El plan 02 **no** inventa el guard: lo usa y completa el store de sesión / login UI.
- Login, mock de usuarios y layout final son del [plan-02-auth](./plan-02-auth.md).
