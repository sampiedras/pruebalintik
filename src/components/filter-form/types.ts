export type FilterFieldType = 'text' | 'select'

export interface FilterFieldOption {
  label: string
  value: string
}

export interface FilterField {
  name: string
  label: string
  type: FilterFieldType
  options?: FilterFieldOption[]
  required?: boolean
}

export interface FilterFormProps {
  fields: FilterField[]
}

export type FilterSearchPayload = Record<string, string>

export interface FilterFormEmits {
  (event: 'search', payload: FilterSearchPayload): void
  (event: 'clear'): void
}
