<script setup lang="ts">
import FilterForm from '@/components/filter-form/index.vue'
import PaymentForm from '@/components/payment-form/index.vue'
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentMethod,
} from '@/types/payment'
import { formatDate } from '@/utils/format-date'
import {
  PAYMENTS_FILTER_FIELDS,
  PAYMENTS_ROWS_PER_PAGE,
  PAYMENTS_TABLE_COLUMNS,
} from './constants'
import { usePaymentsPage } from './usePaymentsPage'

const {
  items,
  loading,
  pagination,
  dialogOpen,
  dialogTitle,
  paymentFormRef,
  handleSearch,
  handleClear,
  handleToggleStatus,
  openCreateDialog,
  openEditDialog,
  closeDialog,
  handleFormSubmit,
  handleRemove,
} = usePaymentsPage()
</script>

<template>
  <section class="payments-page" data-testid="payments-page">
    <header class="payments-page__hero">
      <div class="payments-page__hero-copy">
        <h1 class="payments-page__title">Métodos de pago</h1>
        <span class="payments-page__subtitle">Busca, activa o edita tus métodos.</span>
      </div>

      <q-btn
        color="primary"
        unelevated
        no-caps
        icon="add"
        label="Nuevo método"
        class="payments-page__create"
        data-testid="payment-create"
        @click="openCreateDialog"
      />
    </header>

    <q-card class="payments-page__panel" flat>
      <q-card-section class="payments-page__panel-header">
        <div>
          <h2 class="payments-page__panel-title">Filtros</h2>
          <p class="payments-page__panel-text">
            Usa uno o más campos para acotar la lista.
          </p>
        </div>
      </q-card-section>
      <q-card-section class="payments-page__panel-body">
        <FilterForm
          :fields="PAYMENTS_FILTER_FIELDS"
          @search="handleSearch"
          @clear="handleClear"
        />
      </q-card-section>
    </q-card>

    <q-card class="payments-page__panel" flat>
      <q-card-section class="payments-page__panel-header payments-page__panel-header--row">
        <div>
          <h2 class="payments-page__panel-title">Listado</h2>
          <p class="payments-page__panel-text">
            {{ items.length }} método{{ items.length === 1 ? '' : 's' }} encontrado{{ items.length === 1 ? '' : 's' }}
          </p>
        </div>
      </q-card-section>

      <q-card-section class="payments-page__table-section">
        <q-table
          class="payments-page__table"
          flat
          row-key="id"
          data-testid="payments-table"
          v-model:pagination="pagination"
          :rows="items"
          :columns="PAYMENTS_TABLE_COLUMNS"
          :loading="loading"
          :rows-per-page-options="[PAYMENTS_ROWS_PER_PAGE]"
        >
          <template #no-data>
            <div class="payments-page__empty" data-testid="payments-empty">
              <q-icon name="search_off" size="40px" color="primary" />
              <p class="payments-page__empty-title">No existe este método de pago.</p>
              <p class="payments-page__empty-text">
                Prueba con otros filtros o crea un método nuevo.
              </p>
            </div>
          </template>

          <template #body-cell-type="cell">
            <q-td :props="cell">
              {{ PAYMENT_TYPE_LABELS[cell.row.type as PaymentMethod['type']] }}
            </q-td>
          </template>

          <template #body-cell-description="cell">
            <q-td :props="cell">
              <span class="payments-page__description">
                {{ cell.row.description || 'Sin descripción' }}
              </span>
            </q-td>
          </template>

          <template #body-cell-status="cell">
            <q-td :props="cell">
              <q-badge
                rounded
                class="payments-page__status"
                :color="cell.row.status === 'active' ? 'positive' : 'grey-6'"
                :label="PAYMENT_STATUS_LABELS[cell.row.status as PaymentMethod['status']]"
              />
            </q-td>
          </template>

          <template #body-cell-createdAt="cell">
            <q-td :props="cell">
              {{ formatDate(String(cell.row.createdAt)) }}
            </q-td>
          </template>

          <template #body-cell-active="cell">
            <q-td :props="cell">
              <q-toggle
                dense
                color="primary"
                :model-value="cell.row.status === 'active'"
                :disable="loading"
                :data-testid="`payment-toggle-${cell.row.id}`"
                @update:model-value="handleToggleStatus(String(cell.row.id))"
              />
            </q-td>
          </template>

          <template #body-cell-rowActions="cell">
            <q-td :props="cell">
              <div class="payments-page__row-actions">
                <q-btn
                  flat
                  dense
                  round
                  color="primary"
                  icon="edit"
                  :data-testid="`payment-edit-${cell.row.id}`"
                  @click="openEditDialog(cell.row as PaymentMethod)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  icon="delete"
                  :data-testid="`payment-delete-${cell.row.id}`"
                  @click="handleRemove(cell.row as PaymentMethod)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card class="payments-page__dialog" data-testid="payment-dialog">
        <q-card-section class="payments-page__dialog-header">
          <div>
            <p class="payments-page__eyebrow">Formulario</p>
            <div class="payments-page__dialog-title">{{ dialogTitle }}</div>
          </div>
          <q-btn
            v-close-popup
            flat
            round
            dense
            icon="close"
            data-testid="payment-dialog-close"
            @click="closeDialog"
          />
        </q-card-section>

        <q-card-section class="payments-page__dialog-body">
          <PaymentForm
            ref="paymentFormRef"
            @submit="handleFormSubmit"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<style scoped>
.payments-page {
  display: grid;
  gap: var(--app-space-md);
}

.payments-page__hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--app-space-md);
  flex-wrap: wrap;
  padding: var(--app-space-sm) var(--app-space-md);
  border-radius: var(--app-radius-md);
  background:
    linear-gradient(135deg, rgb(15 118 110 / 12%), rgb(14 165 164 / 6%)),
    var(--app-color-surface);
  box-shadow: var(--app-shadow-sm);
}

.payments-page__hero-copy {
  display: flex;
  flex-direction: column;
}

.payments-page__title {
  margin: 0;
  color: var(--app-color-text);
  font-size: var(--app-font-size-lg);
  font-weight: 800;
  line-height: normal;
  letter-spacing: -0.02em;
}

.payments-page__subtitle {
  margin: 0;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}

.payments-page__create {
  border-radius: var(--app-radius-md);
  font-weight: 700;
}

.payments-page__panel {
  overflow: hidden;
  border-radius: var(--app-radius-md);
  background: var(--app-color-surface);
  box-shadow: var(--app-shadow-sm);
}

.payments-page__panel-header {
  padding: 0 var(--app-space-md) 0;
}

.payments-page__panel-header--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.payments-page__panel-title {
  margin: 0;
  color: var(--app-color-text);
  font-size: var(--app-font-size-md);
  font-weight: 700;
}

.payments-page__panel-text {
  margin: 0;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}

.payments-page__panel-body {
  padding-top: 0;
}

.payments-page__table-section {
  padding-top: 0;
}

.payments-page__table {
  background: transparent;
}

.payments-page__description {
  color: var(--app-color-text-muted);
}

.payments-page__status {
  padding: 0.25rem 0.6rem;
  font-weight: 600;
}

.payments-page__row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--app-space-xs);
}

.payments-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--app-space-sm);
  width: 100%;
  min-height: 14rem;
  padding: var(--app-space-xl);
  text-align: center;
}

.payments-page__empty-title {
  margin: 0;
  color: var(--app-color-text);
  font-size: var(--app-font-size-md);
  font-weight: 700;
}

.payments-page__empty-text {
  margin: 0;
  max-width: 22rem;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}

.payments-page__dialog {
  display: flex;
  flex-direction: column;
  width: min(100%, 30rem);
  max-height: min(90vh, 40rem);
  overflow: hidden;
  border-radius: var(--app-radius-xl);
}

.payments-page__dialog-header {
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--app-space-md);
  padding-bottom: 0;
  background: var(--app-color-surface);
}

.payments-page__dialog-title {
  color: var(--app-color-text);
  font-size: var(--app-font-size-lg);
  font-weight: 700;
}

.payments-page__dialog-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
</style>
