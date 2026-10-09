<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { APP_LOGO_URL, APP_NAME } from '@/config/app'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

async function onLogout(): Promise<void> {
  authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <q-layout view="hHh lpR fFf" class="main-layout" data-testid="main-layout">
    <q-header class="main-layout__header" elevated>
      <q-toolbar class="main-layout__toolbar">
        <div class="main-layout__brand">
          <img
            class="main-layout__logo"
            :src="APP_LOGO_URL"
            :alt="`${APP_NAME} logo`"
            data-testid="app-logo"
          >
          <span class="main-layout__brand-name">{{ APP_NAME }}</span>
          <span class="main-layout__brand-divider" aria-hidden="true" />
          <q-toolbar-title shrink class="main-layout__title">
            Métodos de pago
          </q-toolbar-title>
        </div>

        <q-space />

        <div class="main-layout__actions">
          <span v-if="user" class="main-layout__user" data-testid="header-user">
            {{ user.username }}
          </span>
          <q-btn
            unelevated
            no-caps
            color="white"
            text-color="primary"
            icon="logout"
            label="Cerrar sesión"
            class="main-layout__logout"
            data-testid="logout-button"
            @click="onLogout"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container class="main-layout__container">
      <q-page class="main-layout__page">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.main-layout {
  background: var(--app-color-background);
}

.main-layout__header {
  background: var(--app-color-primary);
  color: var(--app-color-on-primary);
  box-shadow: var(--app-shadow-sm);
}

.main-layout__toolbar {
  min-height: var(--app-header-height);
  max-width: var(--app-layout-max-width);
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--app-space-lg);
}

.main-layout__brand {
  display: flex;
  align-items: center;
  gap: var(--app-space-md);
  min-width: 0;
}

.main-layout__logo {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
}

.main-layout__brand-name {
  font-size: var(--app-font-size-lg);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.main-layout__brand-divider {
  width: 1px;
  height: 1.5rem;
  background: rgb(255 255 255 / 35%);
}

.main-layout__title {
  padding: 0;
  font-size: var(--app-font-size-sm);
  font-weight: 500;
  opacity: 0.92;
}

.main-layout__actions {
  display: flex;
  align-items: center;
  gap: var(--app-space-md);
}

.main-layout__user {
  font-size: var(--app-font-size-sm);
  font-weight: 600;
  opacity: 0.92;
}

.main-layout__logout {
  border-radius: var(--app-radius-md);
  font-weight: 700;
}

.main-layout__container {
  background:
    radial-gradient(circle at top right, rgb(14 165 164 / 10%), transparent 28%),
    var(--app-color-background);
}

.main-layout__page {
  max-width: var(--app-layout-max-width);
  margin: 0 auto;
  padding: var(--app-page-padding-y) var(--app-space-lg) var(--app-space-2xl);
}

@media (max-width: 600px) {
  .main-layout__brand-divider,
  .main-layout__title,
  .main-layout__user {
    display: none;
  }
}
</style>
