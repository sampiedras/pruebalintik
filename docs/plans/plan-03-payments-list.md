# Plan 03: Listado de métodos de pago (+ filtro genérico)

## Objetivo

Implementar la pantalla principal de métodos de pago: tabla con datos del mock, filtro genérico reutilizable conectado al listado, y activar/desactivar desde la fila con actualización inmediata en la UI. Cada componente y cada pieza de lógica llevan pruebas unitarias colindantes.

## Dependencias

- [Plan 02: Auth](./plan-02-auth.md) completado, incluyendo:
  - Sesión (`authStore`), login, logout y `main-layout`
  - Ruta `/` protegida con `meta.requiresAuth` y child `payments` (placeholder actual)

## Documentación de referencia

- [OVERVIEW.md](../OVERVIEW.md) — §5.2 Listado, §5.3 Filtros, §6 Arquitectura, §7 Modelo
- [Skill: Crear componentes Vue](../skills/create-vue-component/SKILL.md) — **obligatoria** antes de crear cualquier SFC

## Reglas clave

- Aplicar la skill `create-vue-component` en **todo** SFC nuevo (`filter-form`, `payments`).
- Un componente = carpeta kebab-case con `index.vue` + `index.spec.ts`.
- Lógica de UI en `useX.ts` + `useX.spec.ts`. Sin composable vacío.
- Contrato composable: el SFC declara `emit` en top level; `const { loading, formRef, ... } = useX(emit)`. Estado local (`loading`) como `ref` en el composable, no como prop. Ver skill.
- `defineProps` solo para configurar el componente desde fuera (p. ej. `fields` del filtro). No para estado que el composable puede poseer.
- Estilos parametrizados: tokens en `src/css/variables.css` / `quasar-variables.sass`; el SFC usa `var(--app-*)`, sin hex sueltos.
- El mock es el único que simula la API de pagos (lista + cambio de estado).
- El store de pagos es el único que llama al mock y dispara `Notify` en error.
- **`filter-form` es genérico:** no importa Pinia, ni el mock, ni tipos de `PaymentMethod`. Solo conoce su contrato de props/emits.
- La page de pagos conoce el negocio: arma los `fields`, llama al store y pinta la tabla.
- Sin Axios: funciones del mock retornan `Promise`.
- Specs colindantes. No usar `src/__tests__/` para código nuevo.
- **Fuera de este plan:** alta, edición y baja (van en un plan posterior). Aquí no hay formulario de pago ni diálogo de borrado.

## Flujo de usuario

```
Login OK → / (payments)
    │
    ▼
Page carga listado (store.fetchPayments)
    │
    ├─▶ filter-form ──search──▶ page ──▶ store.fetchPayments(filters)
    │                 ──clear──▶ page ──▶ store.fetchPayments() / filtros vacíos
    │
    └─▶ QTable filas
            │
            └─▶ QToggle estado ──▶ store.toggleStatus(id)
                    │
                    └─▶ mock actualiza ──▶ store actualiza lista ──▶ UI sin reload
```

## Tareas

### 3.1 Contratos TypeScript

`src/types/payment.ts`

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

/** Filtros que entiende el mock/store (claves opcionales). */
interface PaymentListFilters {
  name?: string
  type?: PaymentType
  status?: PaymentStatus
}
```

Opcional en el mismo archivo o en labels de la page: mapa `PaymentType` → etiqueta en español para la tabla y el select del filtro.

### 3.2 Util de payload limpio

```
src/utils/clean-payload.ts
src/utils/clean-payload.spec.ts
```

- Función pura: recibe un objeto y devuelve solo claves con valor significativo (excluye `''`, `null`, `undefined`).
- La usa el composable del filtro (o la page si se prefiere); no depende de Vue ni de pagos.
- Spec: casos con vacíos, nulos y valores válidos.

### 3.3 Mock de pagos

```
src/mocks/data/payments.ts
src/mocks/services.ts          # ampliar (ya existe loginMock)
src/mocks/services.spec.ts     # ampliar
```

- Seed en memoria con varios `PaymentMethod` (al menos 4–6; mix de tipos y estados).
- `listPaymentsMock(filters?: PaymentListFilters): Promise<PaymentMethod[]>`
  - Latencia vía `delay` (500–1000 ms).
  - Filtra en el mock por `name` (parcial, case-insensitive), `type` y `status` cuando vengan en el payload.
- `updatePaymentStatusMock(id: string, status: PaymentStatus): Promise<PaymentMethod>`
  - Latencia vía `delay`.
  - Actualiza el registro en el seed; si no existe → `reject`.
  - Camino opcional de error simulado para probar `Notify`.
- Specs del mock: listado sin filtros, con filtros, toggle ok, id inexistente. Sin montar Vue.

### 3.4 Store de pagos

```
src/stores/payment/index.ts
src/stores/payment/index.spec.ts
```

- Estado: `items`, `loading`, `filters` (últimos filtros aplicados).
- `fetchPayments(filters?: PaymentListFilters)`: llama solo a `listPaymentsMock`; actualiza `items` y `filters`; en fallo `Notify` + re-lanza (mismo criterio explícito que auth).
- `toggleStatus(id: string)`: deriva el estado contrario del item en `items`, llama a `updatePaymentStatusMock`, reemplaza el item en `items` (o refresca de forma coherente) para que la UI cambie al instante; en fallo `Notify` + re-lanza y no deja la fila a medias.
- Spec: mockea las funciones del mock; no monta template. Afirma lista, filtros, toggle y propagación de error.

### 3.5 Componente FilterForm (skill) — genérico

```
src/components/filter-form/
├── index.vue
├── index.spec.ts
├── types.ts
├── useFilterForm.ts
└── useFilterForm.spec.ts
```

Contrato (OVERVIEW §5.3):

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

- Props: `fields: FilterField[]` (configuración real del padre → sí va en `defineProps`).
- Emite: `search` (payload sin vacíos) y `clear`.
- `QForm` + `QInput` / `QSelect` según `type`.
- Estado interno y `loading` como `ref` en `useFilterForm` (no prop).
- Buscar: validar `required`; si falla, no emitir; si ok, emitir objeto limpio (`clean-payload`).
- Limpiar: reset al estado inicial y emitir `clear`.
- **Prohibido:** importar `@/stores`, `@/mocks`, `@/types/payment`.
- Spec del SFC: render según `fields`; no emite `search` con required vacío; emite sin claves vacías; `clear` resetea.
- Spec del composable: payload limpio y reset sin montar Quasar.

### 3.6 Page Payments (skill)

```
src/pages/payments/
├── index.vue
├── index.spec.ts
├── usePaymentsPage.ts
└── usePaymentsPage.spec.ts
```

Reemplazar el placeholder actual.

- Al montar: `fetchPayments()` (vía composable / `onMounted` o equivalente en `usePaymentsPage`).
- Arma `fields` del filtro en la page (nombre texto, tipo select, estado select). Etiquetas en español.
- Conecta:
  - `@search` → `fetchPayments(filters)`
  - `@clear` → `fetchPayments()` / filtros vacíos
- Tabla Quasar (`QTable`) con columnas obligatorias:
  - Nombre
  - Tipo (etiqueta legible, no el raw enum si se puede evitar)
  - Estado (Activo / Inactivo)
  - Fecha de creación (formateada para UI; ISO queda en el modelo)
- Columna o celda con `QToggle` (o acción directa) para activar/desactivar → `toggleStatus(id)`.
- Loader de tabla ligado a `loading` del store.
- `usePaymentsPage`: conecta store + handlers; no llama al mock.
- Spec de page: mockea store; afirma que al montar pide listado; search/clear/toggle disparan las actions.
- Spec del composable: handlers delegan al store (store mockeado).

### 3.7 Ruta y layout

- Confirmar que `/` (name `payments`) apunta a la page real de este plan (ya cableada en plan 02).
- Ajustar copy del `main-layout` si el placeholder hablaba de “próximamente” (solo si hace falta; sin rediseñar el layout).

### 3.8 Verificación

```bash
nvm use 22
npm run test:unit -- --run
npm run type-check
npm run dev
```

Recorrido manual:

1. Login → pantalla de métodos de pago con filas del mock
2. Columnas visibles: Nombre, Tipo, Estado, Fecha de creación
3. Filtrar por nombre / tipo / estado → la tabla refleja el resultado del mock
4. Limpiar filtros → vuelve el listado completo
5. Toggle Activo/Inactivo en una fila → cambia en la UI sin recargar
6. (Opcional) forzar error del mock de status → Notify y la fila no queda inconsistente

## Archivos a crear / tocar

| Archivo | Descripción |
|---------|-------------|
| `src/types/payment.ts` | Contratos de pagos y filtros |
| `src/utils/clean-payload.ts` + spec | Quitar vacíos del payload de búsqueda |
| `src/mocks/data/payments.ts` | Seed en memoria |
| `src/mocks/services.ts` + spec | `listPaymentsMock`, `updatePaymentStatusMock` |
| `src/stores/payment/index.ts` + spec | Store de listado + toggle |
| `src/components/filter-form/*` | Filtro genérico (skill) |
| `src/pages/payments/*` | Page listado (skill); reemplaza placeholder |
| `src/css/variables.css` | Tokens nuevos solo si la tabla/filtro lo requieren |

## Criterios de aceptación

- [ ] Skill `create-vue-component` aplicada a `filter-form` y `payments`
- [ ] Cada `.vue` nuevo/reemplazado tiene `index.spec.ts` colindante
- [ ] Cada `use*.ts` nuevo tiene `use*.spec.ts` colindante
- [ ] `filter-form` no importa stores, mock ni tipos de pago
- [ ] Tabla muestra Nombre, Tipo, Estado y Fecha de creación
- [ ] Buscar emite/aplica solo claves con valor; required vacíos no disparan búsqueda
- [ ] Limpiar resetea el filtro y recarga el listado sin filtros
- [ ] Toggle de estado actualiza la fila al instante sin recargar la página
- [ ] Loading visible mientras el store espera al mock
- [ ] Errores: `Notify` desde el store y el error se propaga (sin `catch` vacío que lo trague)
- [ ] Ningún componente llama al mock; solo el store
- [ ] `npm run test:unit -- --run` pasa
- [ ] `npm run type-check` pasa
- [ ] Recorrido manual de los pasos OK
- [ ] Commit sugerido: `feat(payments): add payment list, filters and status toggle`

## Notas

- Alta / edición / eliminación con confirmación **no** entran en este plan. Ver [plan-04-payments-form](./plan-04-payments-form.md).
- Paginación de servidor queda fuera de alcance (OVERVIEW §11).
- El seed del mock debe ser suficiente para demostrar filtros (varios tipos y ambos estados).
- Si hace falta formatear fechas, preferir util pura en `src/utils/` con spec, no lógica en el template.
