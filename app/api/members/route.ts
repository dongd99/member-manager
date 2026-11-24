import { NextResponse } from 'next/server'
import { normalizeMemberInput, validateMemberInput } from '@/lib/members'
import { createMember, DuplicateEmailError, listMembers } from '@/lib/members-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ members: listMembers() })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const input = normalizeMemberInput(body)
  const errors = validateMemberInput(input)
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  try {
    const member = createMember(input)
    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return NextResponse.json({ errors: { email: error.message } }, { status: 409 })
    }
    throw error
  }
}
