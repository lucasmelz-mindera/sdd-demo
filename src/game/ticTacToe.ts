import type { Profile } from '../profile/profile'

export type Mark = 'X' | 'O'
export type Seat = 'host' | 'guest'
export type Cell = Mark | null
export type Player = { name: string; emoji: string; mark: Mark }
export type Result =
  | { kind: 'playing' }
  | { kind: 'win'; mark: Mark; line: [number, number, number] }
  | { kind: 'draw' }
export type GameState = {
  players: Record<Seat, Player>
  board: Cell[] // length 9, row-major
  turn: Mark
  result: Result
  rematchVotes: Seat[]
}
export type Action =
  | { type: 'move'; seat: Seat; cell: number }
  | { type: 'rematch'; seat: Seat }

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

export function newGame(host: Profile, guest: Profile): GameState {
  return {
    players: {
      host: { name: host.name, emoji: host.emoji, mark: 'X' },
      guest: { name: guest.name, emoji: guest.emoji, mark: 'O' },
    },
    board: Array<Cell>(9).fill(null),
    turn: 'X',
    result: { kind: 'playing' },
    rematchVotes: [],
  }
}

/** Returns the same object when the action is illegal, so callers can tell. */
export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'move':
      return move(state, action.seat, action.cell)
    case 'rematch':
      return rematch(state, action.seat)
  }
}

function move(state: GameState, seat: Seat, cell: number): GameState {
  const mark = state.players[seat].mark
  if (state.result.kind !== 'playing') return state
  if (mark !== state.turn) return state
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) return state
  if (state.board[cell] !== null) return state

  const board = state.board.slice()
  board[cell] = mark
  return { ...state, board, turn: other(mark), result: resultOf(board) }
}

function rematch(state: GameState, seat: Seat): GameState {
  if (state.result.kind === 'playing') return state
  if (state.rematchVotes.includes(seat)) return state

  const rematchVotes = [...state.rematchVotes, seat]
  if (rematchVotes.length < 2) return { ...state, rematchVotes }

  const { host, guest } = state.players
  return {
    players: { host: { ...host, mark: other(host.mark) }, guest: { ...guest, mark: other(guest.mark) } },
    board: Array<Cell>(9).fill(null),
    turn: 'X',
    result: { kind: 'playing' },
    rematchVotes: [],
  }
}

function resultOf(board: Cell[]): Result {
  for (const line of LINES) {
    const mark = board[line[0]]
    if (mark && board[line[1]] === mark && board[line[2]] === mark) return { kind: 'win', mark, line }
  }
  return board.includes(null) ? { kind: 'playing' } : { kind: 'draw' }
}

const other = (mark: Mark): Mark => (mark === 'X' ? 'O' : 'X')
