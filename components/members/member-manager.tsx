'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { SearchIcon, UserPlusIcon, UsersIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Member, MemberInput } from '@/lib/members'
import { createMember, deleteMember, fetchMembers, MEMBERS_KEY, updateMember } from '@/lib/members-api'
import { MemberForm } from './member-form'
import { MemberTable } from './member-table'
import { EditMemberDialog } from './edit-member-dialog'
import { DeleteMemberDialog } from './delete-member-dialog'

export function MemberManager() {
  const { data: members, error, isLoading, mutate } = useSWR(MEMBERS_KEY, fetchMembers)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Member | null>(null)
  const [deleting, setDeleting] = useState<Member | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!members || !q) return members ?? []
    const digits = q.replace(/\D/g, '')
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.includes(q) ||
        (digits.length > 0 && m.phone.replace(/-/g, '').includes(digits)),
    )
  }, [members, query])

  async function handleCreate(input: MemberInput) {
    const { member } = await createMember(input)
    await mutate((current = []) => [member, ...current], { revalidate: false })
    toast.success(`${member.name} 회원이 등록되었습니다.`)
  }

  async function handleUpdate(id: number, input: MemberInput) {
    const { member } = await updateMember(id, input)
    await mutate((current = []) => current.map((m) => (m.id === id ? member : m)), { revalidate: false })
    setEditing(null)
    toast.success('회원 정보가 수정되었습니다.')
  }

  async function handleDelete(target: Member) {
    try {
      await deleteMember(target.id)
      await mutate((current = []) => current.filter((m) => m.id !== target.id), { revalidate: false })
      setDeleting(null)
      toast.success(`${target.name} 회원이 삭제되었습니다.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제하지 못했습니다.')
      await mutate()
      setDeleting(null)
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[22rem_1fr]">
      <section
        aria-labelledby="register-heading"
        className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 text-card-foreground lg:sticky lg:top-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UserPlusIcon className="size-4" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <h2 id="register-heading" className="font-semibold">
              회원 등록
            </h2>
            <p className="text-sm text-muted-foreground">모든 항목은 필수입니다.</p>
          </div>
        </div>
        <MemberForm submitLabel="등록하기" onSubmit={handleCreate} resetOnSuccess />
      </section>

      <section
        aria-labelledby="list-heading"
        className="flex min-w-0 flex-col rounded-xl border border-border bg-card text-card-foreground"
      >
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-2">
            <h2 id="list-heading" className="font-semibold">
              회원 목록
            </h2>
            <span className="text-sm text-muted-foreground" aria-live="polite">
              {members ? (
                <>
                  <span className="font-mono">{query ? `${filtered.length}/${members.length}` : members.length}</span>명
                </>
              ) : null}
            </span>
          </div>
          <div className="relative sm:w-64">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="member-search" className="sr-only">
              회원 검색
            </label>
            <Input
              id="member-search"
              type="search"
              placeholder="이름, 이메일, 전화번호 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3 p-5" aria-busy="true" aria-label="회원 목록 불러오는 중">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="p-10 text-center text-sm text-destructive">
            회원 목록을 불러오지 못했습니다.
          </p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <UsersIcon className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              {query ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다. 왼쪽 폼에서 첫 회원을 등록해 보세요.'}
            </p>
          </div>
        ) : (
          <MemberTable members={filtered} onEdit={setEditing} onDelete={setDeleting} />
        )}
      </section>

      <EditMemberDialog
        member={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSubmit={handleUpdate}
      />
      <DeleteMemberDialog
        member={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
