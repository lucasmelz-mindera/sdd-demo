import { DEFAULT_EMOJI, EMOJIS } from './emojis'

export type Profile = { name: string; emoji: string }

export const MAX_NAME_LENGTH = 20
const STORAGE_KEY = 'sdd-demo:profile'

/** Trims and caps the name, falls back to the default emoji; null when there's no usable name. */
export function sanitizeProfile(p: unknown): Profile | null {
  if (typeof p !== 'object' || p === null || Array.isArray(p)) return null
  const { name, emoji } = p as Record<string, unknown>
  if (typeof name !== 'string') return null
  const trimmed = name.trim().slice(0, MAX_NAME_LENGTH)
  if (!trimmed) return null
  return { name: trimmed, emoji: typeof emoji === 'string' && EMOJIS.includes(emoji) ? emoji : DEFAULT_EMOJI }
}

// Storage can throw (private mode, blocked site data); a missing profile is fine.
export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === null ? null : sanitizeProfile(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // ignored: the profile just won't be remembered
  }
}
