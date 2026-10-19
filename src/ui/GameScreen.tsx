import type { Board as BoardCells, Mark, Result } from '../game/ticTacToe'
import type { PlayerInfo } from '../room/protocol'
import { Board } from './Board'
import { Players } from './Players'

type Props = {
  board: BoardCells
  turn: Mark
  result: Result
  players: Record<Mark, PlayerInfo>
  you: Mark
  onMove: (cell: number) => void
}

export function GameScreen({ board, turn, result, players, you, onMove }: Props) {
  return (
    <main className="screen">
      <h1>Tic-tac-toe</h1>
      <Players players={players} you={you} turn={result === null ? turn : null} />
      <p className="status">{statusText(turn, result, players, you)}</p>
      <Board board={board} result={result} canMove={result === null && turn === you} onMove={onMove} />
    </main>
  )
}

function statusText(turn: Mark, result: Result, players: Record<Mark, PlayerInfo>, you: Mark) {
  if (result === 'draw') return "It's a draw"
  if (result) return result.winner === you ? 'You win!' : `${players[result.winner].name} wins`
  return turn === you ? 'Your turn' : `${players[turn].name}'s turn`
}
