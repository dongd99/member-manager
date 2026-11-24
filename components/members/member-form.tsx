'use client'

import { useId, useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  formatPhone,
  normalizeMemberInput,
  validateMemberInput,
  type FieldErrors,
  type MemberField,
  type MemberInput,
} from '@/lib/members'
import { MemberRequestError } from '@/lib/members-api'

const EMPTY: MemberInput = { name: '', email: '', phone: '', birthDate: '' }

const FIELDS: {
  key: MemberField
  label: string
  type: string
  placeholder?: string
  autoComplete: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}[] = [
  { key: 'name', label: '이름', type: 'text', placeholder: '홍길동', autoComplete: 'name' },
  { key: 'email', label: '이메일', type: 'email', placeholder: 'name@example.com', autoComplete: 'email' },
  {
    key: 'phone',
    label: '전화번호',
    type: 'tel',
    placeholder: '010-1234-5678',
    autoComplete: 'tel',
    inputMode: 'numeric',
  },
  { key: 'birthDate', label: '생년월일', type: 'date', autoComplete: 'bday' },
]

type MemberFormProps = {
  initialValues?: MemberInput
  submitLabel: string
  onSubmit: (input: MemberInput) => Promise<void>
  onCancel?: () => void
  resetOnSuccess?: boolean
}

export function MemberForm({
  initialValues = EMPTY,
  submitLabel,
  onSubmit,
  onCancel,
  resetOnSuccess = false,
}: MemberFormProps) {
  const formId = useId()
  const [values, setValues] = useState<MemberInput>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  function handleChange(key: MemberField, value: string) {
    setValues((prev) => ({ ...prev, [key]: key === 'phone' ? formatPhone(value) : value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = normalizeMemberInput(values)
    const nextErrors = validateMemberInput(input)
    setErrors(nextErrors)
    setFormError(null)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit(input)
      if (resetOnSuccess) setValues(EMPTY)
    } catch (error) {
      if (error instanceof MemberRequestError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors)
      } else {
        setFormError(error instanceof Error ? error.message : '요청을 처리하지 못했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {FIELDS.map((field) => {
        const id = `${formId}-${field.key}`
        const errorId = `${id}-error`
        const error = errors[field.key]
        return (
          <div key={field.key} className="flex flex-col gap-2">
            <Label htmlFor={id}>
              {field.label}
              <span aria-hidden="true" className="text-primary">
                *
              </span>
            </Label>
            <Input
              id={id}
              name={field.key}
              type={field.type}
              inputMode={field.inputMode}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              value={values[field.key]}
              max={field.type === 'date' ? today : undefined}
              min={field.type === 'date' ? '1900-01-01' : undefined}
              onChange={(e) => handleChange(field.key, e.target.value)}
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="h-10 bg-card"
            />
            {error && (
              <p id={errorId} className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )
      })}

      {formError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" className="h-10 flex-1" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" className="h-10 flex-1" disabled={submitting}>
          {submitting && <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
