import type { Board as BoardCells, Result } from '../game/ticTacToe'

type Props = {
  board: BoardCells
  result: Result
  canMove: boolean
  onMove: (cell: number) => void
}

// The 3×3 grid. Empty cells are clickable only while `canMove`; a winning line is highlighted.
export function Board({ board, result, canMove, onMove }: Props) {
  const line: number[] = result && result !== 'draw' ? result.line : []
  return (
    <div className="board" role="grid" aria-label="Board">
      {board.map((cell, i) => (
        <button
          key={i}
          className={line.includes(i) ? 'cell win' : 'cell'}
          disabled={!canMove || cell !== null}
          onClick={() => onMove(i)}
          aria-label={cell ?? `Empty cell ${i + 1}`}
        >
          {cell}
        </button>
      ))}
    </div>
  )
}
