export type PaymentType = 'credit_card' | 'debit_card' | 'cash' | 'transfer'
export type PaymentStatus = 'active' | 'inactive'

export interface PaymentMethod {
  id: string
  name: string
  type: PaymentType
  status: PaymentStatus
  description?: string
  createdAt: string
}

export interface PaymentListFilters {
  name?: string
  type?: PaymentType
  status?: PaymentStatus
}

export interface PaymentFormValues {
  name: string
  type: PaymentType | ''
  status: PaymentStatus
  description: string
}

export interface PaymentFormPayload {
  name: string
  type: PaymentType
  status: PaymentStatus
  description?: string
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  cash: 'Efectivo',
  transfer: 'Transferencia',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
}

export const PAYMENT_TYPE_OPTIONS = (
  Object.entries(PAYMENT_TYPE_LABELS) as [PaymentType, string][]
).map(([value, label]) => ({ label, value }))

export const PAYMENT_STATUS_OPTIONS = (
  Object.entries(PAYMENT_STATUS_LABELS) as [PaymentStatus, string][]
).map(([value, label]) => ({ label, value }))
