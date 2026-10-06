import { describe, expect, it } from 'vitest'
import { ROOM_ID_ALPHABET, generateRoomId, shareUrl, toPeerId } from './roomId'

const ID_PATTERN = /^[23456789a-hjkmnp-z]{6}$/

describe('generateRoomId', () => {
  it('uses the unambiguous alphabet', () => {
    expect(ROOM_ID_ALPHABET).toBe('23456789abcdefghjkmnpqrstuvwxyz')
  })

  it('maps injected random bytes onto the alphabet', () => {
    const random = (n: number) => Uint8Array.from({ length: n }, (_, i) => i)
    expect(generateRoomId(random)).toBe('234567')
  })

  it('wraps bytes beyond the alphabet length', () => {
    const random = (n: number) => new Uint8Array(n).fill(31 + 8) // 39 % 31 = 8 → 'a'
    expect(generateRoomId(random)).toBe('aaaaaa')
  })

  it('returns 6 chars from the alphabet with the real random source', () => {
    for (let i = 0; i < 200; i++) expect(generateRoomId()).toMatch(ID_PATTERN)
  })
})

describe('toPeerId', () => {
  it('adds the sdd-ttt- prefix', () => {
    expect(toPeerId('k7m2qx')).toBe('sdd-ttt-k7m2qx')
  })
})

describe('shareUrl', () => {
  it('is <origin>/sdd-demo/#/room/<id>', () => {
    expect(shareUrl('k7m2qx', 'https://lucasmelz-mindera.github.io')).toBe(
      'https://lucasmelz-mindera.github.io/sdd-demo/#/room/k7m2qx',
    )
  })
})
