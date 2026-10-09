import type { Credentials, SessionUser } from '@/types/auth'
import type {
  PaymentFormPayload,
  PaymentListFilters,
  PaymentMethod,
  PaymentStatus,
} from '@/types/payment'
import { getPaymentsSeed } from './data/payments'
import { MOCK_USERS } from './data/users'
import { delay, randomLatency } from './delay'

export interface LoginMockOptions {
  simulateError?: boolean
}

export async function loginMock(
  credentials: Credentials,
  options: LoginMockOptions = {},
): Promise<SessionUser> {
  await delay(randomLatency())

  if (options.simulateError) {
    throw new Error('Error de conexión')
  }

  const matchedUser = MOCK_USERS.find(
    (user) =>
      user.username === credentials.username.trim() &&
      user.password === credentials.password,
  )

  if (!matchedUser) {
    throw new Error('Credenciales inválidas')
  }

  return {
    id: matchedUser.id,
    username: matchedUser.username,
  }
}

const matchesFilters = (
  payment: PaymentMethod,
  filters: PaymentListFilters = {},
): boolean => {
  if (filters.name) {
    const needle = filters.name.trim().toLowerCase()
    if (!payment.name.toLowerCase().includes(needle)) return false
  }

  if (filters.type && payment.type !== filters.type) return false
  if (filters.status && payment.status !== filters.status) return false

  return true
}

export async function listPaymentsMock(
  filters: PaymentListFilters = {},
): Promise<PaymentMethod[]> {
  await delay(randomLatency())

  return getPaymentsSeed()
    .filter((payment) => matchesFilters(payment, filters))
    .map((payment) => structuredClone(payment))
}

export async function updatePaymentStatusMock(
  id: string,
  status: PaymentStatus,
): Promise<PaymentMethod> {
  await delay(randomLatency())

  const payment = getPaymentsSeed().find((item) => item.id === id)!
  payment.status = status
  return structuredClone(payment)
}

export async function createPaymentMock(
  input: PaymentFormPayload,
): Promise<PaymentMethod> {
  await delay(randomLatency())

  const payments = getPaymentsSeed()
  const created: PaymentMethod = {
    id: `pay-${Date.now()}`,
    name: input.name,
    type: input.type,
    status: input.status,
    createdAt: new Date().toISOString(),
    ...(input.description ? { description: input.description } : {}),
  }

  payments.unshift(created)
  return structuredClone(created)
}

export async function updatePaymentMock(
  id: string,
  input: PaymentFormPayload,
): Promise<PaymentMethod> {
  await delay(randomLatency())

  const payment = getPaymentsSeed().find((item) => item.id === id)!
  payment.name = input.name
  payment.type = input.type
  payment.status = input.status

  if (input.description) {
    payment.description = input.description
  } else {
    delete payment.description
  }

  return structuredClone(payment)
}

export async function deletePaymentMock(id: string): Promise<void> {
  await delay(randomLatency())

  const payments = getPaymentsSeed()
  const index = payments.findIndex((item) => item.id === id)
  payments.splice(index, 1)
}
