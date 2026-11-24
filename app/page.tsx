import { MemberManager } from '@/components/members/member-manager'

export default function Page() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-widest text-primary uppercase">Member Admin · Demo</p>
        <h1 className="text-2xl font-bold tracking-tight text-balance md:text-3xl">회원 관리</h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          회원을 등록하고, 목록에서 정보를 확인·수정·삭제할 수 있습니다.
        </p>
      </header>
      <MemberManager />
    </main>
  )
}
