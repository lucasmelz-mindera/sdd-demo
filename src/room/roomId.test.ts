import { describe, expect, it } from 'vitest'
import { ROOM_ID_ALPHABET, generateRoomId, isValidRoomId, parseRoute, toPeerId } from './roomId'

describe('generateRoomId', () => {
  it('is 6 characters from the alphabet', () => {
    for (let i = 0; i < 200; i++) {
      const id = generateRoomId()
      expect(id).toHaveLength(6)
      for (const ch of id) expect(ROOM_ID_ALPHABET).toContain(ch)
    }
  })

  it('uses lowercase alphanumerics without look-alikes', () => {
    expect(ROOM_ID_ALPHABET).toMatch(/^[a-z0-9]+$/)
    for (const ch of '0o1l') expect(ROOM_ID_ALPHABET).not.toContain(ch)
    expect(ROOM_ID_ALPHABET).toHaveLength(32)
  })

  it('maps the random source onto the alphabet', () => {
    expect(generateRoomId(() => 0)).toBe(ROOM_ID_ALPHABET[0].repeat(6))
    expect(generateRoomId(() => 0.9999)).toBe(ROOM_ID_ALPHABET.at(-1)!.repeat(6))
  })

  it('always produces a valid ID', () => {
    for (let i = 0; i < 200; i++) expect(isValidRoomId(generateRoomId())).toBe(true)
  })
})

describe('isValidRoomId', () => {
  it('accepts 6 alphabet characters', () => {
    expect(isValidRoomId('k7m2qx')).toBe(true)
  })

  it.each(['', 'k7m2q', 'k7m2qxx', 'K7M2QX', 'k7m2q0', 'k7m2qo', 'k7m2q1', 'k7m2ql', 'k7m-qx', 'k7m qx'])(
    'rejects %j',
    (s) => {
      expect(isValidRoomId(s)).toBe(false)
    },
  )
})

describe('toPeerId', () => {
  it('prefixes the room ID', () => {
    expect(toPeerId('k7m2qx')).toBe('sdd-ttt-k7m2qx')
  })
})

describe('parseRoute', () => {
  it.each(['', '#', '#/'])('%j is the picker', (hash) => {
    expect(parseRoute(hash)).toEqual({ kind: 'picker' })
  })

  it('reads a tic-tac-toe room', () => {
    expect(parseRoute('#/tic-tac-toe/k7m2qx')).toEqual({ kind: 'room', game: 'tic-tac-toe', id: 'k7m2qx' })
  })

  it.each([
    '#/checkers/k7m2qx',
    '#/tic-tac-toe/',
    '#/tic-tac-toe',
    '#/tic-tac-toe/k7m2q0',
    '#/tic-tac-toe/K7M2QX',
    '#/tic-tac-toe/k7m2qx/extra',
    '#/tic-tac-toe/k7m2q',
    '#/tic-tac-toe/k7m2qxk',
    '#/tic-tac-toe/k7m2qx?x=1',
    '#/Tic-Tac-Toe/k7m2qx',
    '#tic-tac-toe/k7m2qx',
    '#/nonsense',
  ])('%j is a bad link', (hash) => {
    expect(parseRoute(hash)).toEqual({ kind: 'bad-link' })
  })
})
