<script setup lang="ts">
import type { FilterFormEmits, FilterFormProps } from './types'
import { useFilterForm } from './useFilterForm'

defineProps<FilterFormProps>()
const emit = defineEmits<FilterFormEmits>()

const { loading, formRef, values, rulesFor, onSearch, onClear } = useFilterForm(emit)
</script>

<template>
  <q-form
    ref="formRef"
    class="filter-form"
    data-testid="filter-form"
    @submit.prevent="onSearch"
  >
    <div class="filter-form__fields">
      <template v-for="field in fields" :key="field.name">
        <q-input
          v-if="field.type === 'text'"
          v-model="values[field.name]"
          outlined
          dense
          clearable
          class="filter-form__field"
          :label="field.label"
          :rules="rulesFor(field)"
          :disable="loading"
          :data-testid="`filter-${field.name}`"
        />

        <q-select
          v-else
          v-model="values[field.name]"
          outlined
          dense
          emit-value
          map-options
          clearable
          class="filter-form__field"
          :label="field.label"
          :options="field.options ?? []"
          :rules="rulesFor(field)"
          :disable="loading"
          :data-testid="`filter-${field.name}`"
        />
      </template>
    </div>

    <div class="filter-form__actions">
      <q-btn
        type="submit"
        color="primary"
        unelevated
        no-caps
        label="Buscar"
        data-testid="filter-search"
        :loading="loading"
        :disable="loading"
      />
      <q-btn
        type="button"
        flat
        no-caps
        color="primary"
        label="Limpiar"
        data-testid="filter-clear"
        :disable="loading"
        @click="onClear"
      />
    </div>
  </q-form>
</template>

<style scoped>
.filter-form {
  display: flex;
  flex-direction: column;
  gap: var(--app-space-md);
}

.filter-form__fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--app-space-md);
}

.filter-form__field {
  width: 100%;
}

.filter-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--app-space-sm);
}
</style>
