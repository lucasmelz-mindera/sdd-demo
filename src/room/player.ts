import type { PlayerInfo } from './protocol'

export const EMOJIS = ['🦊', '🐸', '🐼', '🐙', '🦄', '🐝', '🐢', '🦁', '🐧', '🐳', '🦉', '🐲', '🍕', '🌵', '🚀', '⭐'] as const

export const MAX_NAME_LENGTH = 20

// A trimmed name of 1–20 characters and an emoji from the grid, or null.
export function normalizePlayer(player: PlayerInfo): PlayerInfo | null {
  const name = player.name.trim()
  if (name.length < 1 || name.length > MAX_NAME_LENGTH) return null
  if (!(EMOJIS as readonly string[]).includes(player.emoji)) return null
  return { name, emoji: player.emoji }
}
