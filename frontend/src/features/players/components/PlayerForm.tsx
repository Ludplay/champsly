import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PlayerInput } from '../types/players'

type PlayerFormProps = {
  defaultName?: string
  submitLabel: string
  error?: string | null
  disabled?: boolean
  onCancel?: () => void
  onSubmit: (player: PlayerInput) => void | Promise<void>
}

export function PlayerForm({
  defaultName = '',
  submitLabel,
  error,
  disabled = false,
  onCancel,
  onSubmit,
}: PlayerFormProps) {
  const [name, setName] = useState(defaultName)

  useEffect(() => {
    setName(defaultName)
  }, [defaultName])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit({ name: name.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Name</label>
        <Input
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
          placeholder="Enter player name"
          disabled={disabled}
          required
        />
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled || !name.trim()}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
