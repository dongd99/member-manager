'use client'

import { PencilIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatMemberId, type Member } from '@/lib/members'

type MemberTableProps = {
  members: Member[]
  onEdit: (member: Member) => void
  onDelete: (member: Member) => void
}

function getAge(birthDate: string) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (beforeBirthday) age -= 1
  return age
}

function formatDate(iso: string) {
  return iso.slice(0, 10).replaceAll('-', '.')
}

function RowActions({ member, onEdit, onDelete }: { member: Member } & Omit<MemberTableProps, 'members'>) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon-sm" onClick={() => onEdit(member)} aria-label={`${member.name} 수정`}>
        <PencilIcon aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(member)}
        aria-label={`${member.name} 삭제`}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2Icon aria-hidden="true" />
      </Button>
    </div>
  )
}

export function MemberTable({ members, onEdit, onDelete }: MemberTableProps) {
  return (
    <>
      <ul className="flex flex-col divide-y divide-border md:hidden">
        {members.map((member) => (
          <li key={member.id} className="flex items-start justify-between gap-3 px-4 py-4">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="font-medium">{member.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{formatMemberId(member.id)}</span>
              </div>
              <span className="truncate text-sm text-muted-foreground">{member.email}</span>
              <span className="font-mono text-sm text-muted-foreground">
                {member.phone} · {formatDate(member.birthDate)}
              </span>
            </div>
            <RowActions member={member} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>

      <Table className="hidden md:table">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">회원번호</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>전화번호</TableHead>
            <TableHead>생년월일</TableHead>
            <TableHead className="pr-5 text-right">
              <span className="sr-only">관리</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="pl-5 font-mono text-xs text-muted-foreground">
                {formatMemberId(member.id)}
              </TableCell>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell className="max-w-52 truncate">{member.email}</TableCell>
              <TableCell className="font-mono text-sm">{member.phone}</TableCell>
              <TableCell className="font-mono text-sm">
                {formatDate(member.birthDate)}
                <span className="ml-2 font-sans text-xs text-muted-foreground">만 {getAge(member.birthDate)}세</span>
              </TableCell>
              <TableCell className="pr-5">
                <RowActions member={member} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
