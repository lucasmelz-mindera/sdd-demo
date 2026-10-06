import type { Cell } from '../game/ticTacToe'
import styles from './Board.module.css'

type Props = {
  board: Cell[]
  canMove: boolean
  winLine?: number[]
  onMove(cell: number): void
}

export function Board({ board, canMove, winLine = [], onMove }: Props) {
  return (
    <div className={styles.board} role="grid" aria-label="Tic-tac-toe board">
      {board.map((cell, i) => (
        <button
          key={i}
          className={winLine.includes(i) ? `${styles.cell} ${styles.win}` : styles.cell}
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
