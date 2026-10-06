import { useState, type FormEvent } from 'react'
import { DEFAULT_EMOJI, EMOJIS } from '../profile/emojis'
import { loadProfile, MAX_NAME_LENGTH, sanitizeProfile, saveProfile, type Profile } from '../profile/profile'
import styles from './ProfileForm.module.css'

type Props = { submitLabel: string; onSubmit(profile: Profile): void }

/** Name + emoji, prefilled from and saved to localStorage as the player edits. */
export function ProfileForm({ submitLabel, onSubmit }: Props) {
  const [initial] = useState(loadProfile)
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? DEFAULT_EMOJI)
  const profile = sanitizeProfile({ name, emoji })

  function update(next: { name: string; emoji: string }) {
    setName(next.name)
    setEmoji(next.emoji)
    const p = sanitizeProfile(next)
    if (p) saveProfile(p)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    saveProfile(profile)
    onSubmit(profile)
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.label}>
        Your name
        <input
          className={styles.name}
          value={name}
          maxLength={MAX_NAME_LENGTH}
          placeholder="e.g. Ana"
          autoComplete="nickname"
          onChange={(e) => update({ name: e.target.value, emoji })}
        />
      </label>
      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Pick an emoji</legend>
        <div className={styles.grid}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className={e === emoji ? styles.chosen : styles.emoji}
              aria-pressed={e === emoji}
              onClick={() => update({ name, emoji: e })}
            >
              {e}
            </button>
          ))}
        </div>
      </fieldset>
      <button className={styles.submit} type="submit" disabled={!profile}>
        {submitLabel}
      </button>
    </form>
  )
}
