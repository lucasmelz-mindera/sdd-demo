export type Mark = 'X' | 'O'
export type Cell = Mark | null
export type Board = Cell[]
export type Result = null | { winner: Mark; line: [number, number, number] } | 'draw'

export type Move = { board: Board; turn: Mark; result: Result }

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

export function emptyBoard(): Board {
  return Array(9).fill(null)
}

// `turn` places its mark on `cell`. Null when the cell is off the board or taken, or the game is over.
export function applyMove(board: Board, turn: Mark, cell: number): Move | null {
  if (!Number.isInteger(cell) || cell < 0 || cell > 8 || board[cell] !== null) return null
  if (getResult(board) !== null) return null
  const next = board.slice()
  next[cell] = turn
  return { board: next, turn: turn === 'X' ? 'O' : 'X', result: getResult(next) }
}

export function getResult(board: Board): Result {
  for (const line of LINES) {
    const [a, b, c] = line
    const mark = board[a]
    if (mark && mark === board[b] && mark === board[c]) return { winner: mark, line }
  }
  return board.every((cell) => cell !== null) ? 'draw' : null
}
