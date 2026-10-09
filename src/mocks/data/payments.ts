import type { PaymentMethod, PaymentStatus, PaymentType } from '@/types/payment'

const PAYMENT_TYPES: PaymentType[] = [
  'credit_card',
  'debit_card',
  'cash',
  'transfer',
]

const NAME_PREFIXES = [
  'Visa',
  'Mastercard',
  'Amex',
  'Nequi',
  'Bancolombia',
  'Davivienda',
  'Efectivo',
  'Transferencia',
  'PSE',
  'Diners',
]

const DESCRIPTIONS = [
  'Uso corporativo diario',
  'Cuenta operativa',
  'Gastos de viaje',
  'Pagos a proveedores',
  'Caja menor',
]

const buildInitialPayments = (): PaymentMethod[] =>
  Array.from({ length: 50 }, (_, index) => {
    const n = index + 1
    const type = PAYMENT_TYPES[index % PAYMENT_TYPES.length]!
    const status: PaymentStatus = index % 3 === 0 ? 'inactive' : 'active'
    const prefix = NAME_PREFIXES[index % NAME_PREFIXES.length]!
    const created = new Date(Date.UTC(2024, index % 12, (index % 27) + 1, 10, 0, 0))
    const hasDescription = n % 3 !== 0

    return {
      id: `pay-${n}`,
      name: n === 1 ? 'Visa Corporativa' : `${prefix} ${n}`,
      type: n === 1 ? 'credit_card' : type,
      status: n === 1 ? 'active' : status,
      ...(hasDescription
        ? { description: DESCRIPTIONS[index % DESCRIPTIONS.length] }
        : {}),
      createdAt: created.toISOString(),
    }
  })

export const INITIAL_PAYMENTS: PaymentMethod[] = buildInitialPayments()

let paymentsSeed: PaymentMethod[] = structuredClone(INITIAL_PAYMENTS)

export const getPaymentsSeed = (): PaymentMethod[] => paymentsSeed

export const resetPaymentsSeed = (): void => {
  paymentsSeed = structuredClone(INITIAL_PAYMENTS)
}
