import type { PaymentFormPayload } from '@/types/payment'

export interface PaymentFormEmits {
  (event: 'submit', payload: PaymentFormPayload): void
}
