<script setup lang="ts">
import LoginForm from '@/components/login-form/index.vue'
import { APP_LOGO_URL, APP_NAME } from '@/config/app'
import { useLoginPage } from './useLoginPage'

const { handleSubmit } = useLoginPage()
</script>

<template>
  <div class="login-page" data-testid="login-page">
    <div class="login-page__panel">
      <header class="login-page__brand">
        <div class="login-page__brand-row">
          <img
            class="login-page__logo"
            :src="APP_LOGO_URL"
            :alt="`${APP_NAME} logo`"
            data-testid="app-logo"
          >
          <p class="login-page__brand-name">{{ APP_NAME }}</p>
        </div>
        <h1 class="login-page__headline">Gestiona tus métodos de pago</h1>
        <p class="login-page__lead">
          Inicia sesión para administrar altas, ediciones y el estado de cada método.
        </p>
      </header>

      <q-card class="login-page__card" flat>
        <q-card-section class="login-page__card-header">
          <div class="login-page__card-title">Iniciar sesión</div>
          <div class="login-page__card-subtitle">
            Usa las credenciales del entorno de prueba
          </div>
        </q-card-section>

        <q-card-section>
          <LoginForm @submit="handleSubmit" />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--app-space-xl);
  background-color: var(--app-color-primary-dark);
  background-image: var(--app-pattern-login), var(--app-gradient-login);
  background-size: auto, cover;
}

.login-page__panel {
  width: min(100%, 52rem);
  display: grid;
  gap: var(--app-space-xl);
}

.login-page__brand {
  color: var(--app-color-on-primary);
  max-width: 28rem;
}

.login-page__brand-row {
  display: flex;
  align-items: center;
  gap: var(--app-space-md);
  margin-bottom: var(--app-space-md);
}

.login-page__logo {
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 10px rgb(0 0 0 / 18%));
}

.login-page__brand-name {
  margin: 0;
  font-size: var(--app-font-size-display);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.login-page__headline {
  margin: 0 0 var(--app-space-sm);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.login-page__lead {
  margin: 0;
  max-width: 26rem;
  color: rgb(255 255 255 / 82%);
  font-size: var(--app-font-size-md);
}

.login-page__card {
  width: min(100%, var(--app-login-card-width));
  border-radius: var(--app-radius-xl);
  background: var(--app-color-surface);
  box-shadow: var(--app-shadow-lg);
}

.login-page__card-header {
  padding-bottom: 0;
}

.login-page__card-title {
  margin-bottom: var(--app-space-xs);
  color: var(--app-color-text);
  font-size: var(--app-font-size-lg);
  font-weight: 700;
}

.login-page__card-subtitle {
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}

@media (min-width: 900px) {
  .login-page__panel {
    grid-template-columns: 1.1fr 0.9fr;
    align-items: center;
  }

  .login-page__card {
    justify-self: end;
  }
}
</style>
