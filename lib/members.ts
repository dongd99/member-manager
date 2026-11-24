export type Member = {
  id: number
  name: string
  email: string
  phone: string
  birthDate: string
  createdAt: string
  updatedAt: string
}

export type MemberInput = Pick<Member, 'name' | 'email' | 'phone' | 'birthDate'>

export type MemberField = keyof MemberInput

export type FieldErrors = Partial<Record<MemberField, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_DIGITS_PATTERN = /^0\d{8,10}$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`
  }
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

export function normalizeMemberInput(raw: unknown): MemberInput {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const text = (key: string) => (typeof source[key] === 'string' ? (source[key] as string).trim() : '')
  return {
    name: text('name'),
    email: text('email').toLowerCase(),
    phone: formatPhone(text('phone')),
    birthDate: text('birthDate'),
  }
}

export function validateMemberInput(input: MemberInput): FieldErrors {
  const errors: FieldErrors = {}

  if (!input.name) errors.name = '이름을 입력해 주세요.'
  else if (input.name.length > 30) errors.name = '이름은 30자 이내로 입력해 주세요.'

  if (!input.email) errors.email = '이메일을 입력해 주세요.'
  else if (!EMAIL_PATTERN.test(input.email) || input.email.length > 100)
    errors.email = '올바른 이메일 형식이 아닙니다.'

  if (!input.phone) errors.phone = '전화번호를 입력해 주세요.'
  else if (!PHONE_DIGITS_PATTERN.test(input.phone.replace(/-/g, '')))
    errors.phone = '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)'

  if (!input.birthDate) errors.birthDate = '생년월일을 선택해 주세요.'
  else if (!DATE_PATTERN.test(input.birthDate) || Number.isNaN(Date.parse(input.birthDate)))
    errors.birthDate = '올바른 날짜가 아닙니다.'
  else if (input.birthDate > new Date().toISOString().slice(0, 10))
    errors.birthDate = '생년월일은 오늘 이후일 수 없습니다.'
  else if (input.birthDate < '1900-01-01') errors.birthDate = '1900년 이후 날짜를 입력해 주세요.'

  return errors
}

export function formatMemberId(id: number): string {
  return `M-${String(id).padStart(4, '0')}`
}
