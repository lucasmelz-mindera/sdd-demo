import { describe, expect, it } from 'vitest'
import { newGame, reduce, type Action, type GameState } from './ticTacToe'

const host = { name: 'Host', emoji: '🐶' }
const guest = { name: 'Guest', emoji: '🐱' }

const fresh = () => newGame(host, guest)
const afterHostTakesCell0 = () => reduce(fresh(), { type: 'move', seat: 'host', cell: 0 })

/** Plays cells in order, alternating seats from whoever holds the turn. */
function play(state: GameState, cells: number[]): GameState {
  return cells.reduce((s, cell) => {
    const seat = s.players.host.mark === s.turn ? 'host' : 'guest'
    const next = reduce(s, { type: 'move', seat, cell })
    if (next === s) throw new Error(`illegal move to ${cell}`)
    return next
  }, state)
}

// X: 0 1 2 (top row), O: 3 4
const xWins = () => play(fresh(), [0, 3, 1, 4, 2])
// X O X / X O O / O X X — no line
const drawn = () => play(fresh(), [0, 1, 2, 4, 3, 5, 7, 6, 8])

const LINES: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

/** Moves that let `mark` complete `line`, with the other side filling off-line cells that never make three. */
function winFor(mark: 'X' | 'O', line: [number, number, number]): number[] {
  const others = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((c) => !line.includes(c))
  const isLine = (cells: number[]) => LINES.some((l) => l.every((c) => cells.includes(c)))
  if (mark === 'X') {
    const [a, b] = others
    return [line[0], a, line[1], b, line[2]]
  }
  const filler = others.find((_, i) => !isLine([others[0], others[1], others[i]]) && i > 1)!
  const [a, b] = others
  return [a, line[0], b, line[1], filler, line[2]]
}

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
    ['after the game is over', xWins, { type: 'move', seat: 'guest', cell: 8 }],
  ]

  it.each(illegal)('returns the same state reference on %s', (_, setup, action) => {
    const state = setup()
    expect(reduce(state, action)).toBe(state)
  })
})

describe('reduce: results', () => {
  it.each(LINES.flatMap((line) => (['X', 'O'] as const).map((mark) => [mark, line] as const)))(
    '%s wins on %j',
    (mark, line) => {
      const end = play(fresh(), winFor(mark, line))
      expect(end.result).toEqual({ kind: 'win', mark, line })
    },
  )

  it('keeps playing while there is no line and the board has space', () => {
    expect(play(fresh(), [0, 3, 1]).result).toEqual({ kind: 'playing' })
  })

  it('a full board with no line is a draw', () => {
    const end = drawn()
    expect(end.board.every((c) => c !== null)).toBe(true)
    expect(end.result).toEqual({ kind: 'draw' })
  })

  it('a win on the last cell is a win, not a draw', () => {
    // X O X / O X O / O X X — X completes 0-4-8 with the ninth mark
    const end = play(fresh(), [0, 1, 2, 3, 4, 5, 7, 6, 8])
    expect(end.result).toEqual({ kind: 'win', mark: 'X', line: [0, 4, 8] })
  })
})

describe('reduce: rematch', () => {
  it('is ignored mid-game', () => {
    const state = afterHostTakesCell0()
    expect(reduce(state, { type: 'rematch', seat: 'host' })).toBe(state)
  })

  it('records one vote after the game is over', () => {
    const next = reduce(xWins(), { type: 'rematch', seat: 'guest' })
    expect(next.rematchVotes).toEqual(['guest'])
    expect(next.result.kind).toBe('win')
  })

  it('ignores a duplicate vote', () => {
    const voted = reduce(drawn(), { type: 'rematch', seat: 'host' })
    expect(reduce(voted, { type: 'rematch', seat: 'host' })).toBe(voted)
  })

  it('on both votes, resets the board and swaps marks with X to move', () => {
    const over = xWins()
    const next = reduce(reduce(over, { type: 'rematch', seat: 'host' }), { type: 'rematch', seat: 'guest' })
    expect(next.board).toEqual(Array(9).fill(null))
    expect(next.players.host).toEqual({ ...host, mark: 'O' })
    expect(next.players.guest).toEqual({ ...guest, mark: 'X' })
    expect(next.turn).toBe('X')
    expect(next.result).toEqual({ kind: 'playing' })
    expect(next.rematchVotes).toEqual([])
  })

  it('lets the new X (the guest) move first after a rematch', () => {
    const over = drawn()
    const next = reduce(reduce(over, { type: 'rematch', seat: 'guest' }), { type: 'rematch', seat: 'host' })
    expect(reduce(next, { type: 'move', seat: 'host', cell: 0 })).toBe(next)
    expect(reduce(next, { type: 'move', seat: 'guest', cell: 0 }).board[0]).toBe('X')
  })
})
