# Plan 04: Formulario de creación y edición (+ eliminar)

## Objetivo

Un solo formulario para crear y editar métodos de pago, y eliminar un registro solo después de confirmación. Al guardar o borrar, la tabla se actualiza al instante. Pinia sigue siendo el dueño del listado; el mock es el único que simula la API.

## Dependencias

- [Plan 03: Listado](./plan-03-payments-list.md) completado:
  - `paymentStore` (`items`, `loading`, `filters`, `fetchPayments`, `toggleStatus`)
  - Mock `listPaymentsMock` / `updatePaymentStatusMock` y seed en memoria
  - Page `payments` con filtro, tabla y paginación
  - Tipos `PaymentMethod` (incluye `description`)

## Documentación de referencia

- [OVERVIEW.md](../OVERVIEW.md) — §5.4 Formulario, §5.5 Pinia, §6 Arquitectura
- [Skill: Crear componentes Vue](../skills/create-vue-component/SKILL.md) — **obligatoria** antes de crear o tocar cualquier SFC

## Reglas clave

Aplicar lo ya acordado en login, filtros y listado:

- Skill en el formulario nuevo y en la page `payments` que se amplía.
- Carpeta kebab-case: `index.vue` + `index.spec.ts`. Lógica en `useX.ts` + spec. Sin composable vacío.
- El `.vue` solo pinta. Handlers como `const` (`const onSubmit = async () => {}`). `function` solo si hace falta hoisting (p. ej. con `watch` al inicio).
- El composable recibe **solo `emit`**. No pasar `props` ni usar `toRef(props, ...)`.
- `defineProps` solo si el padre configura de verdad el componente. `loading` del formulario es `ref` dentro de `usePaymentForm`, no prop.
- Estado de UI del formulario (valores, `formRef`, rules, `loading`) vive en el composable. La page no arma el payload.
- Constantes de tabla/filtros se importan **donde se usan** (`index.vue` / `constants.ts`). El composable de la page no las reexporta.
- El formulario de pago **sí** conoce `PaymentMethod` (pertenece a ese módulo). No es genérico como `filter-form`.
- No envolver `QBtn`, `QInput`, `QSelect` o `QDialog` si no hay contrato propio: el diálogo de confirmación es el `Dialog` de Quasar, no un componente nuevo.
- El store es el único que llama al mock y el único que hace `Notify` si algo falla. Sin `catch` vacío.
- Mock simple, como el toggle: muta el seed y devuelve el registro. Sin `simulateError` ni doble chequeo de “no encontrado”.
- Sin Axios. Specs colindantes. Estilos con tokens `--app-*`. Textos de UI en español; identificadores en inglés.
- No recrear listado, filtros ni auth.

## Flujo de usuario

```
Listado
  │
  ├─ Nuevo ──▶ mismo formulario vacío ──guardar──▶ store.create ──▶ tabla al instante
  │
  ├─ Editar fila ──▶ mismo formulario precargado ──guardar──▶ store.update ──▶ fila al instante
  │
  └─ Eliminar fila ──▶ Dialog de confirmación
           ├─ Cancelar ──▶ no borra
           └─ Confirmar ──▶ store.remove ──▶ la fila desaparece
```

## Tareas

### 4.1 Contrato del formulario

En `src/types/payment.ts` (o en `payment-form/types.ts` si solo lo usa el form):

```ts
interface PaymentFormValues {
  name: string
  type: PaymentType | ''
  description: string
}
```

El mock/store reciben un payload ya válido: `name`, `type`, `description?` (omitir descripción vacía). No hace falta otro util: excluir `''` en el `onSubmit`, sin envolver `cleanPayload` en otra función.

### 4.2 Mock

Ampliar `src/mocks/services.ts` + `services.spec.ts`. Reusar el seed de `src/mocks/data/payments.ts`.

- `createPaymentMock(input): Promise<PaymentMethod>`
  - Latencia con `delay`.
  - Crea el registro en el seed (`id` nuevo, `status: 'active'`, `createdAt` ISO, `description` solo si viene).
  - Devuelve una copia.
- `updatePaymentMock(id, input): Promise<PaymentMethod>`
  - Latencia con `delay`.
  - Actualiza `name`, `type` y `description` del registro que ya está en el seed.
  - Devuelve una copia.
- `deletePaymentMock(id): Promise<void>`
  - Latencia con `delay`.
  - Quita el registro del seed.
- Specs: alta aparece en un listado posterior; edición cambia nombre; baja ya no está en el listado. Sin montar Vue.

### 4.3 Store (Pinia)

Ampliar `src/stores/payment/index.ts` + spec. No crear otro store.

- `createPayment(input)`: llama solo a `createPaymentMock` y deja el ítem visible en `items` (insertarlo o volver a listar con `filters` actuales). La tabla no espera un reload de página.
- `updatePayment(id, input)`: llama a `updatePaymentMock` y reemplaza esa fila en `items`.
- `removePayment(id)`: llama a `deletePaymentMock` y quita la fila de `items`.
- Mismo criterio que `toggleStatus`: la acción actualiza el campo/la lista y sincroniza el mock. Sin ramas de “no encontrado” ni `catch` que trague el error.
- Si el mock rechaza, `Notify` y re-lanzar (igual que `fetchPayments`). No hace falta inventar un error simulado.
- Spec: mockea las funciones del mock; afirma que `items` cambia en create, update y remove.

### 4.4 Componente PaymentForm (skill)

```
src/components/payment-form/
├── index.vue
├── index.spec.ts
├── types.ts
├── usePaymentForm.ts
└── usePaymentForm.spec.ts
```

Un solo formulario:

| Campo | UI | Regla |
|-------|----|--------|
| Nombre | `QInput` | requerido |
| Tipo | `QSelect` (`PAYMENT_TYPE_OPTIONS`) | requerido |
| Descripción | `QInput` | opcional |

- Emite `submit` con el payload válido. Si la validación falla, no emite.
- Estado y `loading` dentro de `usePaymentForm`. El SFC hace `const { ... } = usePaymentForm(emit)`.
- Crear vs editar **sin** pasar el registro como prop al composable:
  - `resetForm()` deja el formulario vacío (crear).
  - `fill(payment)` precarga nombre, tipo y descripción (editar).
  - La page llama uno u otro al abrir el diálogo.
- No importa el store ni el mock.
- Spec del SFC: no emite si falta nombre o tipo; emite payload válido; descripción vacía no viaja.
- Spec del composable: `fill` precarga; `resetForm` vacía; `onSubmit` no emite si `validate()` es falso.

### 4.5 Page Payments

Ampliar `usePaymentsPage` + `index.vue` + specs. Columnas/labels nuevos van a `constants.ts` y el `.vue` los importa directo.

- Botón **Nuevo método**: abre `QDialog` con `PaymentForm` vacío (`resetForm`).
- Acción **Editar** en la fila: abre el mismo diálogo y llama `fill(payment)`.
- Guardar: create o update según haya o no un id en edición; cierra el diálogo; la tabla refleja el cambio.
- Acción **Eliminar**: `Dialog.create` de Quasar (confirmar / cancelar). Cancelar no llama al store. Confirmar llama `removePayment(id)` y la fila desaparece.
- El id en edición y si el diálogo está abierto viven en `usePaymentsPage` (`ref`), no en el template suelto.
- Spec de page: nuevo/editar/eliminar disparan las actions del composable (store y `Dialog` mockeados en el spec del composable).
- Spec del composable: `handleCreate` / `handleUpdate` / `handleRemove` delegan al store; cancelar el diálogo no llama a `removePayment`.

### 4.6 Verificación

```bash
nvm use 22
npm run test:unit -- --run
npm run type-check
npm run dev
```

Recorrido manual:

1. Nuevo método con nombre y tipo → aparece en la tabla sin recargar.
2. Guardar sin nombre o sin tipo → validación visible y no se crea.
3. Editar una fila → campos precargados; al guardar, la fila cambia al instante.
4. Eliminar → diálogo; Cancelar deja el registro.
5. Eliminar → Confirmar quita la fila al instante.
6. Descripción vacía no es obligatoria.

## Archivos a crear / tocar

| Archivo | Descripción |
|---------|-------------|
| `src/types/payment.ts` | Payload del formulario, si no vive en el componente |
| `src/mocks/services.ts` + spec | create / update / delete |
| `src/stores/payment/index.ts` + spec | Actions Pinia |
| `src/components/payment-form/*` | Formulario único (skill) |
| `src/pages/payments/constants.ts` | Acciones de fila, si hace falta columna nueva |
| `src/pages/payments/usePaymentsPage.ts` + spec | Abrir crear/editar, confirmar borrado |
| `src/pages/payments/index.vue` + spec | Diálogo + botones |

## Criterios de aceptación

- [ ] Skill aplicada a `payment-form` y a los cambios de `payments`
- [ ] Cada `.vue` nuevo o ampliado tiene `index.spec.ts`
- [ ] Cada `use*.ts` nuevo o ampliado tiene spec
- [ ] Un solo formulario: vacío al crear, precargado al editar
- [ ] Nombre y tipo requeridos; descripción opcional; validación visual y no guarda si falla
- [ ] Guardar actualiza la tabla al instante
- [ ] Eliminar pide confirmación; cancelar no borra; confirmar sí
- [ ] Pinia es el dueño de `items`; solo el store llama al mock
- [ ] Composable del form solo recibe `emit`; sin `toRef`; `loading` como `ref` interno
- [ ] Constantes importadas en el SFC, no reexportadas por el composable de la page
- [ ] `npm run test:unit -- --run` pasa
- [ ] `npm run type-check` pasa
- [ ] Recorrido manual OK
- [ ] Commit sugerido: `feat(payments): add create, edit and delete payment methods`

## Notas

- El filtro genérico no se toca: sigue sin conocer pagos.
- No agregar paginación de servidor ni un segundo formulario.
- Confirmación con `Dialog` de Quasar (ya configurado en el plan 01). Sin SweetAlert ni otro UI kit.
