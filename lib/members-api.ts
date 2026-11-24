import type { FieldErrors, Member, MemberInput } from './members'

export const MEMBERS_KEY = '/api/members'

export class MemberRequestError extends Error {
  constructor(
    message: string,
    public fieldErrors: FieldErrors = {},
  ) {
    super(message)
  }
}

async function handle<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
  }
  const body = await response.json().catch(() => ({}))
  throw new MemberRequestError(body.message ?? '요청을 처리하지 못했습니다.', body.errors ?? {})
}

export const fetchMembers = (url: string) =>
  fetch(url).then((res) => handle<{ members: Member[] }>(res)).then((data) => data.members)

export const createMember = (input: MemberInput) =>
  fetch(MEMBERS_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((res) => handle<{ member: Member }>(res))

export const updateMember = (id: number, input: MemberInput) =>
  fetch(`${MEMBERS_KEY}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((res) => handle<{ member: Member }>(res))

export const deleteMember = (id: number) =>
  fetch(`${MEMBERS_KEY}/${id}`, { method: 'DELETE' }).then((res) => handle<void>(res))
