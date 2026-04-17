import { FormEvent, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { InviteCode } from '@/components/friends/types'

interface InviteCodeCardProps {
  inviteCode: InviteCode | null
  onRegenerate: () => Promise<void>
  onRedeem: (code: string) => Promise<void>
  onMessage: (message: string) => void
}

export function InviteCodeCard({ inviteCode, onRegenerate, onRedeem, onMessage }: InviteCodeCardProps) {
  const [code, setCode] = useState('')

  const redeem = async (event: FormEvent) => {
    event.preventDefault()

    if (!code.trim()) {
      onMessage('Enter an invite code first')
      return
    }

    await onRedeem(code)
    setCode('')
  }

  const copyInviteCode = async () => {
    if (!inviteCode?.code) return

    try {
      await navigator.clipboard.writeText(inviteCode.code)
      onMessage('Invite code copied')
    } catch {
      onMessage('Could not copy invite code')
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-800">
      <CardHeader>
        <CardTitle>Invite Code</CardTitle>
        <CardDescription>Share your code or redeem someone else&apos;s code.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-slate-700 bg-slate-900 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Your Code</p>
          <p className="text-2xl font-semibold text-slate-100">{inviteCode?.code || '...'}</p>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={copyInviteCode}>
            Copy
          </Button>
          <Button type="button" variant="outline" onClick={onRegenerate}>
            Regenerate
          </Button>
        </div>

        <form onSubmit={redeem} className="space-y-3">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Enter invite code"
          />
          <Button type="submit" className="bg-slate-700 text-white hover:bg-slate-600">
            Redeem Code
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
