import { NextResponse } from 'next/server'
import { normalizeMemberInput, validateMemberInput } from '@/lib/members'
import { deleteMember, DuplicateEmailError, updateMember } from '@/lib/members-store'

export const runtime = 'nodejs'

type Context = { params: Promise<{ id: string }> }

async function parseId(context: Context) {
  const { id } = await context.params
  const parsed = Number(id)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

const notFound = () => NextResponse.json({ message: '회원을 찾을 수 없습니다.' }, { status: 404 })

export async function PUT(request: Request, context: Context) {
  const id = await parseId(context)
  if (id === null) return notFound()

  const body = await request.json().catch(() => null)
  const input = normalizeMemberInput(body)
  const errors = validateMemberInput(input)
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  try {
    const member = updateMember(id, input)
    return member ? NextResponse.json({ member }) : notFound()
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return NextResponse.json({ errors: { email: error.message } }, { status: 409 })
    }
    throw error
  }
}

export async function DELETE(_request: Request, context: Context) {
  const id = await parseId(context)
  if (id === null || !deleteMember(id)) return notFound()
  return new NextResponse(null, { status: 204 })
}
