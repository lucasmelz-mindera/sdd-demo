import { describe, expect, it } from 'vitest'
import { hostReducer, initialHostState, toStateMessage } from './hostSession'
import type { StateMessage } from './protocol'

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

function seated() {
  return hostReducer(initialHostState(host), { type: 'guestHello', player: guest }).state
}

// Applies moves alternately from host (X) and guest (O), starting with the host.
function playAlternating(cells: number[]) {
  let state = seated()
  cells.forEach((cell, i) => {
    state = hostReducer(state, { type: i % 2 === 0 ? 'hostMove' : 'guestMove', cell }).state
  })
  return state
}

describe('hostReducer moves', () => {
  it('lets the host move first as X, sending the guest the new state', () => {
    const { state, outgoing } = hostReducer(seated(), { type: 'hostMove', cell: 4 })
    expect(state.board[4]).toBe('X')
    expect(state.turn).toBe('O')
    expect(outgoing).toEqual([expect.objectContaining({ type: 'state', turn: 'O', you: 'O' })])
    expect((outgoing[0] as StateMessage).board[4]).toBe('X')
  })

  it('applies a valid guest move and emits state', () => {
    const afterHost = hostReducer(seated(), { type: 'hostMove', cell: 4 }).state
    const { state, outgoing } = hostReducer(afterHost, { type: 'guestMove', cell: 0 })
    expect(state.board[0]).toBe('O')
    expect(state.turn).toBe('X')
    expect(outgoing).toEqual([expect.objectContaining({ type: 'state', board: state.board, turn: 'X' })])
  })

  it('ignores a guest move out of turn and resyncs with state', () => {
    const before = seated()
    const { state, outgoing } = hostReducer(before, { type: 'guestMove', cell: 0 })
    expect(state).toBe(before)
    expect(outgoing).toEqual([expect.objectContaining({ type: 'state', board: Array(9).fill(null), turn: 'X' })])
  })

  it('ignores a guest move on a taken cell and resyncs with state', () => {
    const before = hostReducer(seated(), { type: 'hostMove', cell: 4 }).state
    const { state, outgoing } = hostReducer(before, { type: 'guestMove', cell: 4 })
    expect(state).toBe(before)
    expect(outgoing).toEqual([expect.objectContaining({ type: 'state', board: before.board })])
  })

  it('ignores a guest move before the guest is seated', () => {
    const before = initialHostState(host)
    const { state, outgoing } = hostReducer(before, { type: 'guestMove', cell: 0 })
    expect(state).toBe(before)
    expect(outgoing).toEqual([])
  })

  it('ignores a host move out of turn without sending anything', () => {
    const before = hostReducer(seated(), { type: 'hostMove', cell: 4 }).state
    const { state, outgoing } = hostReducer(before, { type: 'hostMove', cell: 0 })
    expect(state).toBe(before)
    expect(outgoing).toEqual([])
  })

  it('ends the round on a win and sends the result', () => {
    // X: 0 1 2, O: 3 4
    const state = playAlternating([0, 3, 1, 4, 2])
    expect(state.phase).toBe('result')
    expect(state.result).toEqual({ winner: 'X', line: [0, 1, 2] })
    expect(toStateMessage(state).result).toEqual({ winner: 'X', line: [0, 1, 2] })
  })

  it('ends the round on a draw', () => {
    const state = playAlternating([0, 1, 2, 4, 3, 5, 7, 6, 8])
    expect(state.phase).toBe('result')
    expect(state.result).toBe('draw')
  })

  it('accepts no moves after the round ends', () => {
    // X: 0 1 2 wins; O would be next
    const over = playAlternating([0, 3, 1, 4, 2])
    const guestTry = hostReducer(over, { type: 'guestMove', cell: 8 })
    expect(guestTry.state).toBe(over)
    expect(guestTry.outgoing).toEqual([expect.objectContaining({ type: 'state', result: over.result })])
    expect(hostReducer(over, { type: 'hostMove', cell: 8 }).state).toBe(over)
  })
})
