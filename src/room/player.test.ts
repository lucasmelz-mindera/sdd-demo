import { describe, expect, it } from 'vitest'
import { EMOJIS, normalizePlayer } from './player'

describe('normalizePlayer', () => {
  it('offers 16 distinct emojis', () => {
    expect(EMOJIS).toHaveLength(16)
    expect(new Set(EMOJIS).size).toBe(16)
  })

  it('trims the name', () => {
    expect(normalizePlayer({ name: '  Ana ', emoji: EMOJIS[0] })).toEqual({ name: 'Ana', emoji: EMOJIS[0] })
  })

  it('accepts 1 to 20 characters', () => {
    expect(normalizePlayer({ name: 'a', emoji: EMOJIS[0] })).not.toBeNull()
    expect(normalizePlayer({ name: 'a'.repeat(20), emoji: EMOJIS[0] })).not.toBeNull()
    expect(normalizePlayer({ name: 'a'.repeat(21), emoji: EMOJIS[0] })).toBeNull()
    expect(normalizePlayer({ name: '   ', emoji: EMOJIS[0] })).toBeNull()
  })

  it('requires an emoji from the grid', () => {
    expect(normalizePlayer({ name: 'Ana', emoji: 'x' })).toBeNull()
  })
})
