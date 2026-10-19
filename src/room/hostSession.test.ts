import { describe, expect, it } from 'vitest'
import { hostReducer, initialHostState } from './hostSession'

const host = { name: 'Ana', emoji: '🦊' }
const guest = { name: 'Bo', emoji: '🐸' }

describe('hostReducer guestHello', () => {
  it('starts waiting with the host as X', () => {
    const state = initialHostState(host)
    expect(state.phase).toBe('waiting')
    expect(state.host).toEqual(host)
    expect(state.guest).toBeNull()
  })

  it('seats the guest and sends them the state as O', () => {
    const { state, outgoing } = hostReducer(initialHostState(host), { type: 'guestHello', player: guest })
    expect(state.phase).toBe('playing')
    expect(state.guest).toEqual(guest)
    expect(outgoing).toEqual([
      {
        type: 'state',
        board: Array(9).fill(null),
        turn: 'X',
        players: { X: host, O: guest },
        you: 'O',
        result: null,
        rematch: { X: false, O: false },
      },
    ])
  })

  it('ignores a hello with an unknown emoji', () => {
    const { state, outgoing } = hostReducer(initialHostState(host), { type: 'guestHello', player: { name: 'Bo', emoji: 'x' } })
    expect(state.guest).toBeNull()
    expect(outgoing).toEqual([])
  })

  it('trims the guest name and ignores a hello with a blank one', () => {
    const seated = hostReducer(initialHostState(host), { type: 'guestHello', player: { name: '  Bo  ', emoji: '🐸' } })
    expect(seated.state.guest).toEqual(guest)

    const rejected = hostReducer(initialHostState(host), { type: 'guestHello', player: { name: '   ', emoji: '🐸' } })
    expect(rejected.state.guest).toBeNull()
    expect(rejected.outgoing).toEqual([])
  })
})
