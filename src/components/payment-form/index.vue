<script setup lang="ts">
import { PAYMENT_TYPE_OPTIONS } from '@/types/payment'
import type { PaymentFormEmits } from './types'
import { usePaymentForm } from './usePaymentForm'

const emit = defineEmits<PaymentFormEmits>()

const {
  loading,
  formRef,
  values,
  isActive,
  requiredRule,
  resetForm,
  fill,
  finishSubmit,
  onSubmit,
} = usePaymentForm(emit)

defineExpose({
  resetForm,
  fill,
  finishSubmit,
})
</script>

<template>
  <q-form
    ref="formRef"
    class="payment-form"
    data-testid="payment-form"
    @submit.prevent="onSubmit"
  >
    <div class="payment-form__status">
      <q-toggle
        v-model="isActive"
        color="positive"
        label="Estado"
        left-label
        data-testid="payment-status"
        :disable="loading"
      />
    </div>

    <q-input
      v-model="values.name"
      label="Nombre"
      outlined
      class="payment-form__field"
      data-testid="payment-name"
      :rules="requiredRule"
      :disable="loading"
    >
      <template #prepend>
        <q-icon name="badge" />
      </template>
    </q-input>

    <q-select
      v-model="values.type"
      label="Tipo"
      outlined
      emit-value
      map-options
      class="payment-form__field"
      data-testid="payment-type"
      :options="PAYMENT_TYPE_OPTIONS"
      :rules="requiredRule"
      :disable="loading"
    >
      <template #prepend>
        <q-icon name="account_balance_wallet" />
      </template>
    </q-select>

    <q-input
      v-model="values.description"
      label="Descripción (opcional)"
      outlined
      type="textarea"
      autogrow
      class="payment-form__field payment-form__description"
      data-testid="payment-description"
      :disable="loading"
    >
      <template #prepend>
        <q-icon name="notes" />
      </template>
    </q-input>

    <div class="payment-form__actions">
      <q-btn
        type="submit"
        color="primary"
        unelevated
        no-caps
        label="Guardar"
        data-testid="payment-submit"
        :loading="loading"
        :disable="loading"
      />
    </div>
  </q-form>
</template>

<style scoped>
.payment-form {
  display: flex;
  flex-direction: column;
  gap: var(--app-space-md);
}

.payment-form__status {
  display: flex;
  justify-content: flex-end;
  margin-top: calc(var(--app-space-xs) * -1);
}

.payment-form__field {
  width: 100%;
}

.payment-form__description :deep(textarea) {
  min-height: calc(var(--app-space-2xl) * 2);
}

.payment-form__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--app-space-sm);
}
</style>
