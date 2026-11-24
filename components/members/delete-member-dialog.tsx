'use client'

import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Member } from '@/lib/members'

type DeleteMemberDialogProps = {
  member: Member | null
  onOpenChange: (open: boolean) => void
  onConfirm: (member: Member) => Promise<void>
}

export function DeleteMemberDialog({ member, onOpenChange, onConfirm }: DeleteMemberDialogProps) {
  const [pending, setPending] = useState(false)

  async function handleConfirm() {
    if (!member) return
    setPending(true)
    try {
      await onConfirm(member)
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={member !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>회원을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong className="font-semibold text-foreground">{member?.name}</strong> ({member?.email}) 회원의
            정보가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>취소</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm} disabled={pending}>
            {pending && <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />}
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
