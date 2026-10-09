import type { Credentials } from '@/types/auth'

export interface LoginFormEmits {
  (event: 'submit', credentials: Credentials): void
}
