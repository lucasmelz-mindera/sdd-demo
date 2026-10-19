import { describe, expect, it } from 'vitest'
import { applyMove, emptyBoard, getResult, type Board, type Mark } from './ticTacToe'

// Plays `cells` in order from an empty board, X first; fails if any move is illegal.
function play(cells: number[]) {
  let board = emptyBoard()
  let turn: Mark = 'X'
  let result = getResult(board)
  for (const cell of cells) {
    const step = applyMove(board, turn, cell)
    if (!step) throw new Error(`illegal move ${cell}`)
    ;({ board, turn, result } = step)
  }
  return { board, turn, result }
}

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

describe('emptyBoard', () => {
  it('has nine empty cells and no result', () => {
    expect(emptyBoard()).toEqual(Array(9).fill(null))
    expect(getResult(emptyBoard())).toBeNull()
  })
})

describe('turns', () => {
  it('alternates X and O, placing the mover’s mark', () => {
    const first = applyMove(emptyBoard(), 'X', 4)!
    expect(first.board[4]).toBe('X')
    expect(first.turn).toBe('O')
    expect(first.result).toBeNull()

    const second = applyMove(first.board, first.turn, 0)!
    expect(second.board[0]).toBe('O')
    expect(second.turn).toBe('X')
  })

  it('does not change the board it was given', () => {
    const board = emptyBoard()
    applyMove(board, 'X', 0)
    expect(board).toEqual(emptyBoard())
  })
})

describe('wins', () => {
  it.each(LINES)('X wins on the line %i-%i-%i', (a, b, c) => {
    // O fills two cells off the line, never completing one of its own.
    const others = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => ![a, b, c].includes(i))
    const board: Board = emptyBoard()
    board[a] = board[b] = board[c] = 'X'
    board[others[0]] = board[others[1]] = 'O'
    expect(getResult(board)).toEqual({ winner: 'X', line: [a, b, c] })
  })

  it('reports the winner and line through applyMove', () => {
    // X: 0 1 2, O: 3 4
    expect(play([0, 3, 1, 4, 2]).result).toEqual({ winner: 'X', line: [0, 1, 2] })
    // O: 2 4 6
    expect(play([0, 2, 1, 4, 8, 6]).result).toEqual({ winner: 'O', line: [2, 4, 6] })
  })

  it('counts a win on the ninth move as a win, not a draw', () => {
    // X: 0 1 3 5, O: 2 4 7 8, then X takes 6 to complete 0-3-6
    const { result, board } = play([0, 2, 1, 4, 3, 7, 5, 8, 6])
    expect(board.every((c) => c !== null)).toBe(true)
    expect(result).toEqual({ winner: 'X', line: [0, 3, 6] })
  })
})

describe('draw', () => {
  it('is a draw when the board fills with no line', () => {
    // X O X / X O O / O X X
    const { result } = play([0, 1, 2, 4, 3, 5, 7, 6, 8])
    expect(result).toBe('draw')
  })
})

describe('illegal moves', () => {
  it('rejects a taken cell', () => {
    const { board } = play([4])
    expect(applyMove(board, 'O', 4)).toBeNull()
  })

  it('rejects any move once the game is won', () => {
    const { board, turn } = play([0, 3, 1, 4, 2])
    expect(applyMove(board, turn, 8)).toBeNull()
  })

  it('rejects a move on a drawn board', () => {
    const { board, turn } = play([0, 1, 2, 4, 3, 5, 7, 6, 8])
    expect(applyMove(board, turn, 0)).toBeNull()
  })

  it('rejects a cell off the board', () => {
    expect(applyMove(emptyBoard(), 'X', -1)).toBeNull()
    expect(applyMove(emptyBoard(), 'X', 9)).toBeNull()
    expect(applyMove(emptyBoard(), 'X', 1.5)).toBeNull()
  })
})
