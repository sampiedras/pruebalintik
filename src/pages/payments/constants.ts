import type { QTableColumn } from 'quasar'
import type { FilterField } from '@/components/filter-form/types'
import {
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  type PaymentMethod,
} from '@/types/payment'

export const PAYMENTS_ROWS_PER_PAGE = 15

export const PAYMENTS_TABLE_COLUMNS: QTableColumn<PaymentMethod>[] = [
  {
    name: 'name',
    label: 'Nombre',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'type',
    label: 'Tipo',
    field: 'type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'description',
    label: 'Descripción',
    field: 'description',
    align: 'left',
  },
  {
    name: 'status',
    label: 'Estado',
    field: 'status',
    align: 'left',
    sortable: true,
  },
  {
    name: 'createdAt',
    label: 'Fecha de creación',
    field: 'createdAt',
    align: 'left',
    sortable: true,
  },
  {
    name: 'active',
    label: 'Activo',
    field: 'status',
    align: 'center',
  },
  {
    name: 'rowActions',
    label: 'Acciones',
    field: 'id',
    align: 'center',
  },
]

export const PAYMENTS_FILTER_FIELDS: FilterField[] = [
  { name: 'name', label: 'Nombre', type: 'text' },
  {
    name: 'type',
    label: 'Tipo',
    type: 'select',
    options: PAYMENT_TYPE_OPTIONS,
  },
  {
    name: 'status',
    label: 'Estado',
    type: 'select',
    options: PAYMENT_STATUS_OPTIONS,
  },
]
