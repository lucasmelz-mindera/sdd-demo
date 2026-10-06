import { describe, expect, it } from 'vitest'
import { newGame, reduce, type Action, type GameState } from './ticTacToe'

const host = { name: 'Host', emoji: '🐶' }
const guest = { name: 'Guest', emoji: '🐱' }

const fresh = () => newGame(host, guest)
const afterHostTakesCell0 = () => reduce(fresh(), { type: 'move', seat: 'host', cell: 0 })

describe('newGame', () => {
  it('seats the host as X and the guest as O, with X to move on an empty board', () => {
    const game = fresh()
    expect(game.players.host).toEqual({ ...host, mark: 'X' })
    expect(game.players.guest).toEqual({ ...guest, mark: 'O' })
    expect(game.turn).toBe('X')
    expect(game.board).toEqual(Array(9).fill(null))
    expect(game.result).toEqual({ kind: 'playing' })
    expect(game.rematchVotes).toEqual([])
  })
})

describe('reduce: move', () => {
  it('places the mark and flips the turn', () => {
    const next = reduce(fresh(), { type: 'move', seat: 'host', cell: 4 })
    expect(next.board[4]).toBe('X')
    expect(next.turn).toBe('O')

    const after = reduce(next, { type: 'move', seat: 'guest', cell: 0 })
    expect(after.board[0]).toBe('O')
    expect(after.turn).toBe('X')
  })

  it('does not mutate the previous state', () => {
    const game = fresh()
    reduce(game, { type: 'move', seat: 'host', cell: 4 })
    expect(game.board[4]).toBeNull()
    expect(game.turn).toBe('X')
  })

  const illegal: [string, () => GameState, Action][] = [
    ['wrong turn', fresh, { type: 'move', seat: 'guest', cell: 1 }],
    ['wrong seat (host moves twice)', afterHostTakesCell0, { type: 'move', seat: 'host', cell: 1 }],
    ['taken cell', afterHostTakesCell0, { type: 'move', seat: 'guest', cell: 0 }],
    ['cell below range', fresh, { type: 'move', seat: 'host', cell: -1 }],
    ['cell above range', fresh, { type: 'move', seat: 'host', cell: 9 }],
    ['non-integer cell', fresh, { type: 'move', seat: 'host', cell: 1.5 }],
  ]

  it.each(illegal)('returns the same state reference on %s', (_, setup, action) => {
    const state = setup()
    expect(reduce(state, action)).toBe(state)
  })
})
