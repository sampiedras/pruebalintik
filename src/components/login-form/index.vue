<script setup lang="ts">
import type { LoginFormEmits } from './types'
import { useLoginForm } from './useLoginForm'

const emit = defineEmits<LoginFormEmits>()

const { loading, formRef, credentials, requiredRule, onSubmit } = useLoginForm(emit)
</script>

<template>
  <q-form
    ref="formRef"
    class="login-form"
    data-testid="login-form"
    @submit.prevent="onSubmit"
  >
    <q-input
      v-model="credentials.username"
      label="Usuario"
      outlined
      class="login-form__field"
      data-testid="login-username"
      :rules="requiredRule"
      :disable="loading"
      autocomplete="username"
    >
      <template #prepend>
        <q-icon name="person_outline" />
      </template>
    </q-input>

    <q-input
      v-model="credentials.password"
      label="Contraseña"
      type="password"
      outlined
      class="login-form__field"
      data-testid="login-password"
      :rules="requiredRule"
      :disable="loading"
      autocomplete="current-password"
    >
      <template #prepend>
        <q-icon name="lock_outline" />
      </template>
    </q-input>

    <q-btn
      type="submit"
      color="primary"
      unelevated
      no-caps
      class="login-form__submit full-width"
      label="Iniciar sesión"
      data-testid="login-submit"
      :loading="loading"
      :disable="loading"
    />
  </q-form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--app-space-md);
}

.login-form__field {
  width: 100%;
}

.login-form__submit {
  min-height: 2.75rem;
  margin-top: var(--app-space-sm);
  border-radius: var(--app-radius-md);
  font-weight: 700;
}
</style>
