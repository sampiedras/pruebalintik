# Plan 02: Autenticación (Login, Guard y Logout)

## Objetivo

Implementar el flujo de autenticación de la prueba: login con mock, protección de rutas, logout y layout principal. Cada componente y cada pieza de lógica llevan pruebas unitarias colindantes.

## Dependencias

- [Plan 01: Setup](./plan-01-setup.md) completado, incluyendo:
  - Quasar configurado (`src/config/quasar.ts`, plugins Dialog/Notify, auto-import de `Q*`)
  - Router con `routes.ts` + `guards.ts` + `beforeEach` ya registrados

## Documentación de referencia

- [OVERVIEW.md](../OVERVIEW.md) — módulos de auth y arquitectura
- [Skill: Crear componentes Vue](../skills/create-vue-component/SKILL.md) — **obligatoria** antes de crear cualquier SFC

## Reglas clave

- **No recrear el guard** aquí: el plan 01 ya dejó `authGuard` y `meta.requiresAuth`. Este plan solo completa el store de sesión y las vistas que alimentan ese guard.
- Aplicar la skill `create-vue-component` en **todo** SFC (formulario, page, layout). Botón, tabla u otro bloque con contrato propio → misma skill.
- Un componente = carpeta kebab-case con `index.vue` + `index.spec.ts`.
- Lógica de UI en `useX.ts` + `useX.spec.ts`. Sin composable vacío.
- Contrato composable: el SFC declara `emit` en top level; `const { loading, formRef, ... } = useX(emit)`. Estado local (`loading`) como `ref` en el composable, no como prop. Ver skill.
- Estilos parametrizados: tokens en `src/css/variables.css` / `quasar-variables.sass`; el SFC usa `var(--app-*)`, sin hex sueltos.
- El mock es el único que valida credenciales contra datos fijos.
- El store es el único que llama al mock y dispara Notify en error.
- El componente genérico/presentacional no importa Pinia ni el mock.
- Sin Axios: `loginMock` retorna `Promise`.
- Specs colindantes. No usar `src/__tests__/` para código nuevo.

## Flujo de usuario

```
App launch
    │
    ▼
¿Hay sesión? ──No──▶ /login
    │
   Sí
    ▼
Layout principal (/) ──Logout──▶ limpia store ──▶ /login
    │
URL protegida sin sesión ──▶ redirect /login
```

## Tareas

### 2.1 Contratos TypeScript

`src/types/auth.ts`

- `Credentials`: `username`, `password`
- `SessionUser`: `id`, `username`

### 2.2 Mock de autenticación

```
src/mocks/data/users.ts
src/mocks/delay.ts
src/mocks/delay.spec.ts
src/mocks/services.ts
src/mocks/services.spec.ts
```

- Usuario y contraseña fijos documentables para el README.
- `loginMock(credentials): Promise<SessionUser>`
- Latencia 500–1000 ms vía `delay`.
- Credenciales inválidas → `reject`.
- Camino opcional de error de conexión para probar Notify.
- Specs del mock: éxito, credencial incorrecta, error simulado. Sin montar Vue.

### 2.3 Store de sesión

```
src/stores/auth/index.ts
src/stores/auth/index.spec.ts
```

- Estado: `user`, `isAuthenticated`, `loading`
- `login`: llama solo a `loginMock`; en éxito guarda sesión; en fallo limpia y `Notify`
- `logout`: limpia sesión
- Spec: mockea `loginMock`; no monta template

### 2.4 Componente LoginForm (skill)

```
src/components/login-form/
├── index.vue
├── index.spec.ts
├── types.ts
├── useLoginForm.ts
└── useLoginForm.spec.ts
```

- `QForm` + `QInput` (usuario y contraseña requeridos)
- Emite `submit` con `Credentials` solo si el form es válido
- Prop `loading` para el botón
- No importa store ni mock
- Spec: no emite si faltan campos; emite payload válido; refleja `loading`

### 2.5 Page Login (skill)

```
src/pages/login/
├── index.vue
├── index.spec.ts
├── useLoginPage.ts
└── useLoginPage.spec.ts
```

- Monta `LoginForm`
- `useLoginPage` conecta `submit` → `authStore.login` → `router.push('/')`
- Spec mockea store y router

### 2.6 Conectar rutas del plan 01 al flujo auth

El guard y las rutas ya existen desde el plan 01. En este plan:

- Asegurar que `/login` apunta a la page de login real.
- Asegurar que `/` usa `main-layout` + placeholder/listado con `meta.requiresAuth: true`.
- El guard sigue leyendo `useAuthStore().isAuthenticated` (store de este plan).
- Ampliar specs del guard si hace falta (login con sesión → home).

### 2.7 Main layout + logout (skill)

```
src/layouts/main-layout/
├── index.vue
└── index.spec.ts
```

- Header con botón **Cerrar sesión**
- Click → `authStore.logout` → `router.push('/login')`
- Spec: el click dispara logout (store mockeado)

### 2.8 Limpieza del scaffold

- Eliminar `src/stores/counter.ts` si nada lo usa
- Retirar o reemplazar `src/__tests__/App.spec.ts` (el estándar es spec colindante)

### 2.9 Verificación

```bash
nvm use 22
npm run test:unit -- --run
npm run type-check
npm run dev
```

Recorrido manual:

1. Abrir `/` sin sesión → Login
2. Credencial incorrecta → alerta, permanece en Login
3. Credencial del mock → entra al layout
4. Cerrar sesión → Login
5. Pegar `/` tras logout → Login

## Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/types/auth.ts` | Contratos de auth |
| `src/mocks/data/users.ts` | Usuarios fijos |
| `src/mocks/delay.ts` + spec | Latencia |
| `src/mocks/services.ts` + spec | `loginMock` |
| `src/stores/auth/index.ts` + spec | Store de sesión |
| `src/components/login-form/*` | Formulario presentacional |
| `src/pages/login/*` | Página de login |
| `src/layouts/main-layout/*` | Layout + logout |
| `src/router/routes.ts` | Rutas |
| `src/router/guards.ts` + spec | Protección |
| `src/router/index.ts` | Registro de router + guard |

## Criterios de aceptación

- [ ] Skill `create-vue-component` aplicada a `login-form`, `login` y `main-layout`
- [ ] Cada `.vue` nuevo tiene `index.spec.ts` colindante
- [ ] Cada `use*.ts` nuevo tiene `use*.spec.ts` colindante
- [ ] Login con credenciales del mock otorga acceso al módulo principal
- [ ] Credenciales inválidas muestran error (Notify) y no navegan
- [ ] Ruta protegida sin sesión redirige a `/login`
- [ ] Logout limpia sesión y vuelve a `/login`
- [ ] Ningún componente llama al mock; solo el store
- [ ] `npm run test:unit -- --run` pasa
- [ ] `npm run type-check` pasa
- [ ] Recorrido manual de los 5 pasos OK
- [ ] Commit sugerido: `feat(auth): add login, route guard and logout`

## Notas

- Credenciales de prueba: documentarlas en el README al entregar (o en un comentario del mock).
- Persistencia en `sessionStorage` **no** está en este plan. Si se quiere después, va como supuesto en README.
- El listado de métodos de pago queda fuera; aquí solo un placeholder detrás del layout. Ver [plan-03-payments-list](./plan-03-payments-list.md).
