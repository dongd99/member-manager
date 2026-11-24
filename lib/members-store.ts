import 'server-only'
import type { Member, MemberInput } from './members'

type Store = { members: Member[]; nextId: number }

const SEED: MemberInput[] = [
  { name: '김민준', email: 'minjun.kim@example.com', phone: '010-2345-6789', birthDate: '1992-03-14' },
  { name: '이서연', email: 'seoyeon.lee@example.com', phone: '010-8765-4321', birthDate: '1995-11-02' },
  { name: '박지호', email: 'jiho.park@example.com', phone: '010-5555-1234', birthDate: '1988-07-21' },
]

// Kept on globalThis so the demo data survives dev-server hot reloads.
const globalForStore = globalThis as unknown as { __memberStore?: Store }

function getStore(): Store {
  if (!globalForStore.__memberStore) {
    const now = new Date().toISOString()
    globalForStore.__memberStore = {
      members: SEED.map((m, i) => ({ ...m, id: i + 1, createdAt: now, updatedAt: now })),
      nextId: SEED.length + 1,
    }
  }
  return globalForStore.__memberStore
}

export class DuplicateEmailError extends Error {}

function assertUniqueEmail(email: string, exceptId?: number) {
  if (getStore().members.some((m) => m.email === email && m.id !== exceptId)) {
    throw new DuplicateEmailError('이미 등록된 이메일입니다.')
  }
}

export function listMembers(): Member[] {
  return [...getStore().members].sort((a, b) => b.id - a.id)
}

export function createMember(input: MemberInput): Member {
  assertUniqueEmail(input.email)
  const store = getStore()
  const now = new Date().toISOString()
  const member: Member = { ...input, id: store.nextId++, createdAt: now, updatedAt: now }
  store.members.push(member)
  return member
}

export function updateMember(id: number, input: MemberInput): Member | null {
  const store = getStore()
  const index = store.members.findIndex((m) => m.id === id)
  if (index === -1) return null
  assertUniqueEmail(input.email, id)
  const updated: Member = { ...store.members[index], ...input, updatedAt: new Date().toISOString() }
  store.members[index] = updated
  return updated
}

export function deleteMember(id: number): boolean {
  const store = getStore()
  const before = store.members.length
  store.members = store.members.filter((m) => m.id !== id)
  return store.members.length < before
}
