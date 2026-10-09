---
name: create-vue-component
description: >-
  Creates Vue 3 components for this project as a folder with index.vue,
  index.spec.ts, and a colocated composable when there is logic. Use when
  creating or editing a Vue component, page, layout, SFC, composable, or unit
  test for UI (index.vue, FilterForm, Login, componente, spec).
---

# Crear un componente Vue

Aplica esta skill antes de crear o modificar cualquier SFC (Single File Component:
el `.vue` con template + script + style) del proyecto (botones, tablas, formularios,
pages, layouts).

## Forma obligatoria

Un componente = una carpeta. El spec vive al lado, no en `src/__tests__/`.

```
src/components/<nombre-kebab>/
├── index.vue
├── index.spec.ts
├── types.ts              # solo si hay props, emits o modelos propios
├── use<Nombre>.ts        # solo si hay lógica
└── use<Nombre>.spec.ts   # obligatorio si existe el composable
```

Pages y layouts usan la misma forma (`src/pages/login/`, `src/layouts/main-layout/`).

Un componente o vista **sin** `index.spec.ts` no está terminado. Un `useX.ts` **sin** `useX.spec.ts` no está terminado.

## Reglas

1. `<script setup lang="ts">`. Sin `any`.
2. Props y emits tipados. El genérico (`filter-form`) no importa stores ni tipos de negocio.
3. El `.vue` solo pinta y enlaza. Estado, reglas, refs de form, `onSubmit` y armado del payload van en `use<Nombre>.ts`.
4. No crear composable vacío. Si no hay lógica, el spec del SFC basta.
5. No envolver `QBtn`, `QInput` u otro primitivo de Quasar si no hay un contrato propio.
6. El componente no llama al mock. La page llama actions del store. El store llama al mock.
7. Handlers y helpers del composable: una responsabilidad, cortos (orientativo 20–30 líneas). Preferir `const` (`const onSubmit = async () => {}`). Usar `function` solo cuando haga falta hoisting / ejecución temprana (p. ej. callback que un `watch` registra al inicio y debe existir antes).
8. Textos de UI en español. Identificadores en inglés (`handleSearch`, `useLoginForm`).
9. Cada componente y cada composable nuevo entran con su spec en el mismo cambio.
10. Estilos: valores visuales parametrizados. No hardcodear colores, spacing ni tipografía en el SFC.

## Contrato composable ↔ SFC (obligatorio)

Esta regla aplica a **todos** los composables de componente/page/layout.

### En el composable

- Contiene la lógica: estado local (`ref` / `reactive`), `formRef`, `rules`, handlers (`onSubmit`, `onClear`, …).
- Estado de UI como `loading` se crea en el composable (`const loading = ref(false)`), no llega como prop ni se re-exporta con `toRef`.
- Recibe solo `emit` cuando emite eventos (sin `emit` no puede emitir). **No** recibe `props` ni `toRef(props, ...)` para re-exportarlos; las props de configuración (`fields`, etc.) se usan en el SFC/template.
- Handlers y helpers como `const` (`const onSubmit = async () => {}`). Reservar `function` para casos donde el hoisting importa (p. ej. algo que un `watch` al inicio debe invocar y tiene que existir ya).
- Devuelve un objeto listo para desestructurar: estado y handlers propios del composable.

### En el `index.vue`

1. `const emit = defineEmits<...>()` en top level (si emite).
2. Pasar solo `emit` al composable.
3. Desestructurar el return: `{ loading, formRef, credentials, onSubmit, ... }`.
4. `defineProps` solo si el padre realmente configura el componente (campos, labels, etc.). No para estado que el composable puede poseer (`loading`).

```vue
<script setup lang="ts">
import type { LoginFormEmits } from './types'
import { useLoginForm } from './useLoginForm'

const emit = defineEmits<LoginFormEmits>()

const { loading, formRef, credentials, requiredRule, onSubmit } = useLoginForm(emit)
</script>
```

### Prohibido

- Meter `defineProps` / `withDefaults` / `defineEmits` **dentro** de la llamada al composable. Son macros del compilador: solo funcionan en el top level del SFC. Si se anidan, en runtime aparece `withDefaults is not defined` / falla el type-check.
- Declarar `loading` (u otro estado local) como prop solo para pasarlo al composable o pintarlo: créalo como `ref` en el composable.
- Dejar en el `.vue` lógica que pertenece al composable (`validate()`, `requiredRule`, `toCredentials()`, handlers).

```vue
<!-- MAL -->
const { formRef } = useLoginForm(
  withDefaults(defineProps<{ loading?: boolean }>(), { loading: false }),
  defineEmits<LoginFormEmits>(),
)
```

## Estilos parametrizados

Tokens globales en:

- `src/css/variables.css` — CSS custom properties de la app (`--app-*`)
- `src/css/quasar-variables.sass` — variables Sass de Quasar (`$primary`, etc.)
- `src/css/app.css` — reset / base que consume esos tokens

En el SFC usar `var(--app-...)` o clases utilitarias de Quasar. Si el componente necesita estilos locales, referencian tokens:

```vue
<style scoped>
.login-card {
  max-width: 24rem;
  padding: var(--app-space-xl);
  border-radius: var(--app-radius-lg);
  background: var(--app-color-surface);
  box-shadow: var(--app-shadow-md);
}
</style>
```

Si hace falta un token nuevo, añadirlo a `variables.css` (o a `quasar-variables.sass` si es de Quasar). No inventar hex sueltos en cada vista.

## Qué prueba cada spec

`index.spec.ts` monta `index.vue` con Vue Test Utils (y Quasar cuando el SFC lo use) y afirma comportamiento visible:

- render de campos según props
- emit con el payload esperado
- no emit si la validación falla
- reset al limpiar
- loading / disabled cuando aplique

`use<Nombre>.spec.ts` no monta Quasar. Afirma estado y valores de retorno (incluye `onSubmit` con `formRef` mockeado).

Usar `data-testid` en los controles que el spec necesita pulsar o leer.

## Plantilla del composable

```ts
import { reactive, ref } from 'vue'
import type { QForm } from 'quasar'
import type { FilterFormEmits } from './types'

export function useFilterForm(emit: FilterFormEmits) {
  const loading = ref(false)
  const formRef = ref<QForm | null>(null)
  const values = reactive<Record<string, string>>({})

  const buildSearchPayload = () =>
    Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''))

  const onSubmit = async (): Promise<void> => {
    const isValid = await formRef.value?.validate()
    if (!isValid) return

    loading.value = true
    try {
      emit('search', buildSearchPayload())
    } finally {
      loading.value = false
    }
  }

  return { loading, formRef, values, buildSearchPayload, onSubmit }
}
```

## Plantilla del SFC

```vue
<script setup lang="ts">
import type { FilterFormEmits } from './types'
import { useFilterForm } from './useFilterForm'

const emit = defineEmits<FilterFormEmits>()

const { loading, formRef, values, onSubmit } = useFilterForm(emit)
</script>
```

## Plantilla del spec de componente

```ts
import { mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import { describe, expect, it } from 'vitest'
import FilterForm from './index.vue'

describe('FilterForm', () => {
  it('emits search without empty fields', async () => {
    const wrapper = mount(FilterForm, {
      props: { fields: [{ name: 'name', label: 'Nombre', type: 'text' }] },
      global: { plugins: [Quasar] },
    })

    await wrapper.get('[data-testid="filter-name"]').setValue('visa')
    await wrapper.get('[data-testid="filter-search"]').trigger('click')

    expect(wrapper.emitted('search')?.[0]).toEqual([{ name: 'visa' }])
  })
})
```

## Checklist

- [ ] Carpeta kebab-case con `index.vue` + `index.spec.ts`
- [ ] Lógica en `use<Nombre>.ts` + spec, o ausencia justificada por no haber lógica
- [ ] `defineEmits` en top level; al composable solo se pasa `emit` si hace falta
- [ ] Estado local (`loading`, etc.) como `ref` en el composable, no como prop
- [ ] Handlers/helpers como `const`; `function` solo si hace falta hoisting (p. ej. con `watch` al inicio)
- [ ] Sin lógica de form/handlers en el `.vue`
- [ ] Sin llamadas al mock ni a Pinia dentro de un componente genérico
- [ ] Estilos usan tokens (`--app-*` / Quasar), sin hex sueltos
- [ ] `npm run test:unit -- --run` pasa
