import { useState } from 'react'
import { grantAdminEmailAccess } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (grantAdminEmailAccess(email)) {
      onSuccess()
    } else {
      setError('That email is not authorised.')
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold text-sage-900">Manage facilities</h1>
          <p className="text-sm text-sage-600">Enter your admin email to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@askreillyni.com"
              required
              autoComplete="email"
            />
          </div>
          {error && (
            <p className="text-sm text-terracotta" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
