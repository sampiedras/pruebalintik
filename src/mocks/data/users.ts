/**
 * Demo credentials for the technical test.
 * username: admin
 * password: admin123
 */
export interface MockUser {
  id: string
  username: string
  password: string
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'user-1',
    username: 'admin',
    password: 'admin123',
  },
]
