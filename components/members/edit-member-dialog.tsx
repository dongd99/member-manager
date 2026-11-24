'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatMemberId, type Member, type MemberInput } from '@/lib/members'
import { MemberForm } from './member-form'

type EditMemberDialogProps = {
  member: Member | null
  onOpenChange: (open: boolean) => void
  onSubmit: (id: number, input: MemberInput) => Promise<void>
}

export function EditMemberDialog({ member, onOpenChange, onSubmit }: EditMemberDialogProps) {
  return (
    <Dialog open={member !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>회원 정보 수정</DialogTitle>
          <DialogDescription>
            {member ? (
              <>
                <span className="font-mono">{formatMemberId(member.id)}</span> 회원의 정보를 변경합니다.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        {member && (
          <MemberForm
            key={member.id}
            initialValues={{
              name: member.name,
              email: member.email,
              phone: member.phone,
              birthDate: member.birthDate,
            }}
            submitLabel="저장"
            onCancel={() => onOpenChange(false)}
            onSubmit={(input) => onSubmit(member.id, input)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
