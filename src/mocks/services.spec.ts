import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetPaymentsSeed } from './data/payments'
import {
  createPaymentMock,
  deletePaymentMock,
  listPaymentsMock,
  loginMock,
  updatePaymentMock,
  updatePaymentStatusMock,
} from './services'

vi.mock('./delay', () => ({
  delay: vi.fn(() => Promise.resolve()),
  randomLatency: vi.fn(() => 0),
}))

describe('loginMock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves with the session user for valid credentials', async () => {
    await expect(
      loginMock({ username: 'admin', password: 'admin123' }),
    ).resolves.toEqual({
      id: 'user-1',
      username: 'admin',
    })
  })

  it('rejects when credentials are invalid', async () => {
    await expect(
      loginMock({ username: 'admin', password: 'wrong' }),
    ).rejects.toThrow('Credenciales inválidas')
  })

  it('rejects when a connection error is simulated', async () => {
    await expect(
      loginMock({ username: 'admin', password: 'admin123' }, { simulateError: true }),
    ).rejects.toThrow('Error de conexión')
  })
})

describe('listPaymentsMock', () => {
  beforeEach(() => {
    resetPaymentsSeed()
    vi.clearAllMocks()
  })

  it('returns all payments when filters are empty', async () => {
    const payments = await listPaymentsMock()

    expect(payments).toHaveLength(50)
  })

  it('filters by name, type and status', async () => {
    const payments = await listPaymentsMock({
      name: 'Visa Corporativa',
      type: 'credit_card',
      status: 'active',
    })

    expect(payments).toEqual([
      expect.objectContaining({
        id: 'pay-1',
        name: 'Visa Corporativa',
        type: 'credit_card',
        status: 'active',
      }),
    ])
  })
})

describe('updatePaymentStatusMock', () => {
  beforeEach(() => {
    resetPaymentsSeed()
    vi.clearAllMocks()
  })

  it('updates the status of an existing payment', async () => {
    const updated = await updatePaymentStatusMock('pay-1', 'inactive')

    expect(updated.status).toBe('inactive')

    const listed = await listPaymentsMock({ name: 'Visa Corporativa' })
    expect(listed[0]?.status).toBe('inactive')
  })
})

describe('createPaymentMock', () => {
  beforeEach(() => {
    resetPaymentsSeed()
    vi.clearAllMocks()
  })

  it('creates a payment that appears in a later list', async () => {
    const created = await createPaymentMock({
      name: 'Nuevo método',
      type: 'cash',
      status: 'inactive',
      description: 'Opcional',
    })

    expect(created).toEqual(
      expect.objectContaining({
        name: 'Nuevo método',
        type: 'cash',
        description: 'Opcional',
        status: 'inactive',
      }),
    )

    const listed = await listPaymentsMock({ name: 'Nuevo método' })
    expect(listed).toHaveLength(1)
  })
})

describe('updatePaymentMock', () => {
  beforeEach(() => {
    resetPaymentsSeed()
    vi.clearAllMocks()
  })

  it('updates the name of an existing payment', async () => {
    const updated = await updatePaymentMock('pay-1', {
      name: 'Visa Actualizada',
      type: 'credit_card',
      status: 'inactive',
    })

    expect(updated.name).toBe('Visa Actualizada')
    expect(updated.status).toBe('inactive')

    const listed = await listPaymentsMock({ name: 'Visa Actualizada' })
    expect(listed[0]?.name).toBe('Visa Actualizada')
  })
})

describe('deletePaymentMock', () => {
  beforeEach(() => {
    resetPaymentsSeed()
    vi.clearAllMocks()
  })

  it('removes a payment from later listings', async () => {
    await deletePaymentMock('pay-1')

    const listed = await listPaymentsMock({ name: 'Visa Corporativa' })
    expect(listed).toHaveLength(0)
  })
})
