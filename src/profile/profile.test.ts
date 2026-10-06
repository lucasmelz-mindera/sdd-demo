import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_EMOJI, EMOJIS } from './emojis'
import { loadProfile, sanitizeProfile, saveProfile } from './profile'

describe('EMOJIS', () => {
  it('is a curated set of 20 distinct emojis, the first is the default', () => {
    expect(EMOJIS).toHaveLength(20)
    expect(new Set(EMOJIS).size).toBe(20)
    expect(DEFAULT_EMOJI).toBe(EMOJIS[0])
  })
})

describe('sanitizeProfile', () => {
  it('keeps a valid profile', () => {
    expect(sanitizeProfile({ name: 'Ana', emoji: EMOJIS[3] })).toEqual({ name: 'Ana', emoji: EMOJIS[3] })
  })

  it('trims the name', () => {
    expect(sanitizeProfile({ name: '  Ana  ', emoji: EMOJIS[1] })).toEqual({ name: 'Ana', emoji: EMOJIS[1] })
  })

  it('caps the name at 20 chars', () => {
    expect(sanitizeProfile({ name: 'a'.repeat(30), emoji: EMOJIS[1] })?.name).toBe('a'.repeat(20))
  })

  it('caps after trimming', () => {
    expect(sanitizeProfile({ name: `  ${'b'.repeat(20)}  `, emoji: EMOJIS[1] })?.name).toBe('b'.repeat(20))
  })

  it('replaces an emoji not in EMOJIS with the default', () => {
    expect(sanitizeProfile({ name: 'Ana', emoji: '💩' })).toEqual({ name: 'Ana', emoji: DEFAULT_EMOJI })
    expect(sanitizeProfile({ name: 'Ana', emoji: 7 })).toEqual({ name: 'Ana', emoji: DEFAULT_EMOJI })
    expect(sanitizeProfile({ name: 'Ana' })).toEqual({ name: 'Ana', emoji: DEFAULT_EMOJI })
  })

  it.each([
    ['empty name', { name: '', emoji: EMOJIS[0] }],
    ['blank name', { name: '   ', emoji: EMOJIS[0] }],
    ['missing name', { emoji: EMOJIS[0] }],
    ['numeric name', { name: 5, emoji: EMOJIS[0] }],
    ['null', null],
    ['undefined', undefined],
    ['a string', 'Ana'],
    ['an array', ['Ana', EMOJIS[0]]],
  ])('rejects %s', (_, data) => {
    expect(sanitizeProfile(data)).toBeNull()
  })
})

describe('loadProfile / saveProfile', () => {
  afterEach(() => vi.unstubAllGlobals())

  function fakeStorage() {
    const store = new Map<string, string>()
    return {
      store,
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    }
  }

  it('round-trips through the sdd-demo:profile key', () => {
    const storage = fakeStorage()
    vi.stubGlobal('localStorage', storage)
    saveProfile({ name: 'Ana', emoji: EMOJIS[2] })
    expect(JSON.parse(storage.store.get('sdd-demo:profile')!)).toEqual({ name: 'Ana', emoji: EMOJIS[2] })
    expect(loadProfile()).toEqual({ name: 'Ana', emoji: EMOJIS[2] })
  })

  it('returns null when nothing is saved', () => {
    vi.stubGlobal('localStorage', fakeStorage())
    expect(loadProfile()).toBeNull()
  })

  it('sanitizes what it loads and drops garbage', () => {
    const storage = fakeStorage()
    vi.stubGlobal('localStorage', storage)
    storage.store.set('sdd-demo:profile', JSON.stringify({ name: ' Bo ', emoji: '💩' }))
    expect(loadProfile()).toEqual({ name: 'Bo', emoji: DEFAULT_EMOJI })
    storage.store.set('sdd-demo:profile', '{not json')
    expect(loadProfile()).toBeNull()
  })

  it('swallows storage errors', () => {
    const boom = () => {
      throw new Error('denied')
    }
    vi.stubGlobal('localStorage', { getItem: boom, setItem: boom })
    expect(loadProfile()).toBeNull()
    expect(() => saveProfile({ name: 'Ana', emoji: EMOJIS[0] })).not.toThrow()
  })

  it('swallows a missing localStorage', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(loadProfile()).toBeNull()
    expect(() => saveProfile({ name: 'Ana', emoji: EMOJIS[0] })).not.toThrow()
  })
})
