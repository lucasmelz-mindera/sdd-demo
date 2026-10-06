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
export type Action = { type: 'move'; seat: Seat; cell: number }

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
  return { ...state, board, turn: mark === 'X' ? 'O' : 'X' }
}
