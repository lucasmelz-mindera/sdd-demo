import type { Cell } from '../game/ticTacToe'
import styles from './Board.module.css'

type Props = {
  board: Cell[]
  canMove: boolean
  onMove(cell: number): void
}

export function Board({ board, canMove, onMove }: Props) {
  return (
    <div className={styles.board} role="grid" aria-label="Tic-tac-toe board">
      {board.map((cell, i) => (
        <button
          key={i}
          className={styles.cell}
          disabled={!canMove || cell !== null}
          onClick={() => onMove(i)}
          aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ''}`}
        >
          {cell}
        </button>
      ))}
    </div>
  )
}
