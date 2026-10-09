# Overview — Prueba técnica Frontend

Contexto de trabajo para la prueba técnica. Este documento describe el alcance oficial, las decisiones ya tomadas y propuestas de mercado que **no son requisitos** hasta que se adopten de forma explícita.

---

## 1. Objetivo

Construir una SPA de gestión de métodos de pago que demuestre:

- Arquitectura de producción (aunque el backend sea simulado).
- Separación estricta entre UI y lógica de datos.
- Clean code, reactividad y UX (loaders, errores, confirmaciones).

No se evalúa la integración con servicios externos. Se evalúa cómo estaría organizado el código si existiera una API real.

---

## 2. Decisiones tomadas

| Decisión | Valor |
|----------|--------|
| Lenguaje | **TypeScript** |
| API de componentes | Vue 3 Composition API + `<script setup>` |
| Estado | Pinia |
| Enrutamiento | Vue Router |
| Tests | Vitest (ya incluido en el scaffold) |
| Rama de entrega | `feature/prueba-tecnica` |
| Repo | https://github.com/sampiedras/pruebalintik |

---

## 3. Stack exigido por la prueba

| Área | Tecnología |
|------|------------|
| Framework base | Vue 3 + Quasar Framework |
| Build | Vite (vía Quasar CLI) |
| Estado | Pinia |
| Rutas | Vue Router |
| UI | Componentes de Quasar (`QTable`, `QForm`, `QInput`, `QSelect`, `QToggle`, `QDialog`, `Notify`) |
| Control de versiones | Git con historial de commits |

**Configuración Quasar (plan 01):** plugin Vite (auto-import de `Q*`), `src/config/quasar.ts` con `Dialog`/`Notify` + Material Icons, CSS/tokens, y router con `authGuard` + `meta.requiresAuth`.

---

## 4. Restricciones

- No hay backend real. Todas las llamadas se simulan con datos mock.
- El mock y la simulación del servicio viven en **un solo punto** (un módulo/archivo). No hay promesas simuladas dentro de componentes.
- El store es el único lugar que llama al mock, recibe la respuesta y actualiza el estado.
- Si una operación falla, el **store** dispara o propaga el error global. Las vistas no contienen la lógica interna del fallo.
- El enunciado prohíbe librerías extra de **UI, validación o estado** (por ejemplo SweetAlert, VeeValidate, Tailwind), salvo justificación sólida en el `README.md`.
- **Decisión de arquitectura:** no se usa Axios. No hay API HTTP. El mock expone funciones que devuelven `Promise` y el store las consume como si fueran el servicio.
- Quasar, Vue Router, Pinia, TypeScript y Vitest forman parte del stack base.

---

## 5. Alcance funcional

### 5.1 Autenticación y seguridad

- La app arranca en **Login**.
- Credenciales fijas definidas en el mock.
- Si son válidas, se accede al módulo principal.
- **Guards:** una ruta protegida visitada sin sesión redirige a Login.
- **Logout** visible en la UI: destruye la sesión y redirige a Login.

### 5.2 Listado de métodos de pago

Tabla con, como mínimo:

| Campo | Obligatorio |
|-------|-------------|
| Nombre | Sí |
| Tipo | Sí |
| Estado (Activo / Inactivo) | Sí |
| Fecha de creación | Sí |

- La tabla se conecta al componente de filtros.
- Activar/desactivar desde la fila (switch) y reflejar el cambio al instante, sin recargar.

### 5.3 Componente de filtros reutilizable

Punto crítico de evaluación. Debe ser genérico y **sin conocimiento del negocio**.

**Entrada (props):** lista de campos que lo configura desde fuera. Ejemplo de forma:

```ts
type FilterFieldType = 'text' | 'select'

interface FilterField {
  name: string
  label: string
  type: FilterFieldType
  options?: { label: string; value: string }[]
  required?: boolean
}
```

**Responsabilidad del componente:**

- Renderizar los campos según `fields`.
- Manejar su estado interno.
- **Buscar:** emitir al padre solo las claves con valor (excluir vacíos y nulos). Si hay campos `required` vacíos, mostrar validación visual y no emitir la búsqueda.
- **Limpiar:** resetear campos al estado inicial y notificar al padre.

**Salida (emits):** contrato limpio, por ejemplo `search` y `clear`. El padre decide qué hacer con el objeto; el filtro no filtra la tabla ni conoce “métodos de pago”.

### 5.4 Formulario de creación y edición

Un solo formulario reutilizado:

| Campo | Regla |
|-------|--------|
| Nombre | Requerido |
| Tipo | Select requerido |
| Descripción | Opcional |

- **Crear:** formulario vacío.
- **Editar:** los mismos campos precargados con el registro seleccionado.
- Al guardar, la tabla se actualiza de inmediato.
- **Eliminar:** solo después de confirmación explícita (diálogo). Cancelar no borra.

### 5.5 Pinia

- El listado y su flujo viven en un store (por ejemplo `paymentStore`).
- La sesión vive en otro (por ejemplo `authStore`).
- Las actions son el único sitio de la simulación/mock.
- Estados de carga y error salen del store para alimentar loaders y alertas.

---

## 6. Arquitectura

Flujo equivalente a producción:

```
Page
  → Component (template)
      → composable del componente (estado de UI)
          → action del store (orquestación / reglas de aplicación)
              → mock service (datos + latencia, como una API)
                  → el store actualiza el estado
                      → la UI reacciona
```

### 6.1 Quién hace qué

| Capa | Carpeta | Responsabilidad | Qué no hace |
|------|---------|-----------------|-------------|
| Tipos | `src/types/` | Contratos del dominio y de props | Lógica |
| Mock | `src/mocks/` | Datos, latencia, `resolve` / `reject`. Único punto que simula la API | Vue, Pinia, Quasar |
| Store | `src/stores/` | Estado global, orquestación y reglas de aplicación (sesión, lista, errores, loading) | Template |
| Utils | `src/utils/` | Funciones puras reutilizables (limpiar payload, formatear fecha) | Vue, stores |
| Composable | junto al componente, o `src/composables/` si lo usan 2+ features | Lógica de UI reutilizable o del propio componente | Llamar al mock |
| Component | `src/components/<nombre>/` | Template, props y emits. Delgado | Llamar al mock, reglas de negocio |
| Page | `src/pages/<nombre>/` | Compone componentes y dispara actions del store | Renderizar campos genéricos, simular red |
| Router | `src/router/` | Rutas y guards | Formularios |

Regla del filtro: no importa stores ni tipos de pago. El formulario de pago sí puede usar el tipo `PaymentMethod`, porque pertenece a ese módulo.

### 6.2 Árbol objetivo

Cada unidad lleva su prueba al lado. No se usa una carpeta global `src/__tests__/` para código de dominio.

```
src/
├── types/
│   ├── auth.ts
│   └── payment.ts
├── mocks/
│   ├── data/
│   │   ├── users.ts
│   │   └── payments.ts
│   ├── delay.ts
│   ├── delay.spec.ts
│   ├── services.ts
│   └── services.spec.ts
├── utils/
│   ├── clean-payload.ts
│   └── clean-payload.spec.ts
├── stores/
│   ├── auth/
│   │   ├── index.ts
│   │   └── index.spec.ts
│   └── payment/
│       ├── index.ts
│       └── index.spec.ts
├── components/
│   └── filter-form/
│       ├── index.vue
│       ├── index.spec.ts
│       ├── types.ts
│       ├── useFilterForm.ts
│       └── useFilterForm.spec.ts
├── pages/
│   ├── login/
│   │   ├── index.vue
│   │   ├── index.spec.ts
│   │   ├── useLoginPage.ts
│   │   └── useLoginPage.spec.ts
│   └── payments/
│       ├── index.vue
│       └── index.spec.ts
├── layouts/
│   └── main-layout/
│       ├── index.vue
│       └── index.spec.ts
└── router/
    ├── index.ts
    ├── routes.ts
    ├── guards.ts
    └── guards.spec.ts
```

Ejemplo real de un componente (la forma obligatoria):

```
src/components/filter-form/
├── index.vue              # template + bindings
├── index.spec.ts          # monta el SFC y prueba emits, validación y limpiar
├── types.ts               # props y emits de este componente
├── useFilterForm.ts       # estado interno, payload limpio, reset
└── useFilterForm.spec.ts  # prueba la lógica sin montar Quasar
```

`index.spec.ts` es el spec del componente (el archivo que pediste junto a `index.vue`). Si el componente no tiene lógica propia, no se crea composable vacío: el spec del SFC basta.

### 6.3 Qué se prueba

| Unidad | Archivo | Qué afirma el test |
|--------|---------|--------------------|
| Mock | `services.spec.ts` | Login válido/inválido, latencia, rechazo simulado |
| Store | `stores/auth/index.spec.ts` | Actualiza sesión, limpia en logout, no traga el error |
| Util / composable | `*.spec.ts` colindante | Entradas y salidas puras |
| Componente | `index.spec.ts` | Render, emits, validación, estado vacío |
| Guard | `guards.spec.ts` | Redirige a `/login` sin sesión; deja pasar con sesión |
| Page | `index.spec.ts` | Conecta el formulario con la action; no llama al mock |

La lógica de negocio de aplicación vive en el **store**. La simulación de la API vive en el **mock**. La lógica de un componente vive en su **composable** colindante. El `.vue` no acumula esas tres cosas.

Contrato fijo SFC ↔ composable (ver skill `create-vue-component`):

- En el SFC: `defineEmits` en top level; al composable solo se pasa `emit`.
- Estado local de UI (`loading`, etc.) como `ref` en el composable, no como prop ni con `toRef`.
- En el composable: concentra estado/handlers/rules y los retorna.
- Handlers/helpers como `const` (`const onSubmit = async () => {}`); `function` solo si hace falta hoisting (p. ej. con `watch` al inicio).
- Prohibido anidar `defineEmits` / `defineProps` dentro de la llamada al composable (rompe el compilador de Vue).

---

## 7. Modelo de negocio (supuesto a documentar en el README)

Contrato que el mock debe reflejar. Es un supuesto de la prueba, no una API real.

```ts
type PaymentType = 'credit_card' | 'debit_card' | 'cash' | 'transfer'
type PaymentStatus = 'active' | 'inactive'

interface PaymentMethod {
  id: string
  name: string
  type: PaymentType
  status: PaymentStatus
  description?: string
  createdAt: string // ISO 8601
}

interface Credentials {
  username: string
  password: string
}

interface SessionUser {
  id: string
  username: string
}
```

La tabla muestra Nombre, Tipo, Estado y Fecha de creación. Descripción existe en el formulario y no es columna obligatoria.

---

## 8. Criterios de evaluación

| Área | Qué se observa |
|------|----------------|
| Autenticación | Guards, login y logout limpios |
| Filtros | Abstracción, reutilización real, contrato de entrada/salida |
| Formularios | Validación, un solo flujo crear/editar, feedback visual |
| Estado | Store como dueño de los datos; la vista no contiene el mock |
| Reactividad | Cambios visibles sin recargar |
| Clean code | Modularidad, nombres claros, una responsabilidad por función |
| UX | Loaders, errores claros, confirmación antes de borrar |

Referencia de tamaño: funciones de UI cortas (orientativo 20–30 líneas). La lógica pesada vive en el store o, si hace falta, en un composable.

Nomenclatura de código en inglés (`handleSearch`, `fetchPayments`, `PaymentFilters`). Textos de UI pueden ir en español.

---

## 9. Entregables

1. Código en la rama `feature/prueba-tecnica`.
2. `README.md` en la raíz con:
   - Pasos para instalar y levantar el entorno.
   - Supuestos de estructuras de datos y tipado del modelo.
3. Envío del enlace a:
   - jose.arzusa@linktic.com
   - copia: oscar.otalora@linktic.com

El README también debería justificar, en breve, por qué los stores están separados y cómo el filtro queda desacoplado del módulo de pagos.

---

## 10. Propuestas de mercado

Estas ideas **no forman parte del enunciado**. Quedan como propuesta hasta que se aprueben. No sustituyen a Quasar ni autorizan librerías prohibidas.

| Propuesta | Por qué se usa en el mercado | Nota |
|-----------|------------------------------|------|
| TypeScript estricto (`strict`) | Contratos explícitos en stores, filtros y rutas | Ya decidido usar TS; el modo `strict` es el ajuste fino |
| Pinia con setup stores (`defineStore` + `ref`) | Estilo actual de Vue 3, fácil de testear | El scaffold ya lo trae en `counter.ts` |
| Tipos de dominio en `src/types/` | El mock, el store y los formularios comparten un solo contrato | Evita `any` y tipos duplicados |
| Router con `meta` tipado (`requiresAuth`) | Los guards dejan de depender de strings mágicos | Encaja con el requisito de guards |
| Alias de import (`@/`, `@stores`, `@components`, `@mocks`, `@app-types`) | Imports estables al crecer el árbol de carpetas | `@app-types` evita chocar con `@types/*` de DefinitelyTyped |
| Conventional Commits (`feat:`, `fix:`, `refactor:`) | Historial legible, que la prueba pide revisar | Propuesta de proceso |
| Vitest colindante (`index.spec.ts`, `useX.spec.ts`) | Cada componente y cada función tienen su prueba al lado | Convención de este proyecto, no del enunciado |
| Latencia mock 500–1000 ms + un flag de error | Permite loaders y el flujo de fallo sin backend | Encaja con el requisito de errores; el rango es una convención habitual |
| Persistencia de sesión en `sessionStorage` | Evita perder el login al refrescar | **No lo pide el enunciado.** Si se hace, documentarlo como supuesto |
| ESLint + Prettier | Estilo consistente en equipos | No lo exige la prueba; no añade UI ni estado |
| Quasar Notify y Dialog desde el store / acción de borrar | Alertas y confirmación sin librerías extra | Esto sí es el camino que pide la prueba, usando solo Quasar |

No se agregan Axios, VeeValidate, Zod, SweetAlert, Tailwind ni otro UI kit. Axios no está prohibido por el enunciado; se descarta porque no hay HTTP. El resto choca con la restricción de UI, validación y estado.

Los componentes nuevos siguen la skill `create-vue-component` (`docs/skills/create-vue-component/SKILL.md`).

Planes de ejecución: `docs/plans/plan-01-setup.md`, `docs/plans/plan-02-auth.md`, `docs/plans/plan-03-payments-list.md`, `docs/plans/plan-04-payments-form.md`.

---

## 11. Fuera de alcance

- Backend, base de datos o API HTTP real.
- Registro de usuarios, recuperación de contraseña, roles.
- Paginación de servidor, i18n, PWA, apps móviles.
- Cualquier librería de UI, validación o estado no incluida en Quasar / Vue / Pinia / Vue Router, salvo justificación en el README.

---

## 12. Definition of done (orientativa)

- Login con credenciales del mock, guard y logout.
- Tabla de métodos de pago alimentada por el store.
- Filtro genérico: props de campos, búsqueda sin vacíos, limpiar, validación de requeridos.
- Alta, edición (mismo formulario) y baja con confirmación.
- Toggle de estado sin recargar.
- Loading y error visibles; el error nace en el store.
- Mock centralizado.
- README con instalación y supuestos de tipos.
- Historial en `feature/prueba-tecnica`.

El detalle ejecutable y los criterios de aceptación viven en `docs/plans/`. No se da por cerrado un plan sin cumplir su checklist.
