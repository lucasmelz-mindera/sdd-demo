import { useState, type FormEvent } from 'react'
import { EMOJIS, MAX_NAME_LENGTH, normalizePlayer } from '../room/player'
import type { PlayerInfo } from '../room/protocol'

type Props = { title: string; submitLabel: string; onSubmit: (player: PlayerInfo) => void }

export function PlayerSetup({ title, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState<string>(EMOJIS[0])
  const player = normalizePlayer({ name, emoji })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (player) onSubmit(player)
  }

  return (
    <main className="screen">
      <h1>{title}</h1>
      <form className="setup" onSubmit={submit}>
        <label>
          Your name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH + 10}
            placeholder="1–20 characters"
            autoFocus
          />
        </label>
        <fieldset className="emoji-grid">
          <legend>Your emoji</legend>
          {EMOJIS.map((e) => (
            <button
              type="button"
              key={e}
              className={e === emoji ? 'emoji selected' : 'emoji'}
              aria-pressed={e === emoji}
              onClick={() => setEmoji(e)}
            >
              {e}
            </button>
          ))}
        </fieldset>
        <button type="submit" className="primary" disabled={!player}>
          {submitLabel}
        </button>
      </form>
    </main>
  )
}
