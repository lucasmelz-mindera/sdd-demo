import { Link } from 'react-router'
import type { GameState, Seat } from '../game/ticTacToe'
import type { ClosedReason } from '../net/session'
import type { RoomView } from '../room/roomView'
import { Board } from './Board'
import styles from './RoomScreen.module.css'
import { ShareLink } from './ShareLink'

type Props = { view: RoomView; move(cell: number): void; rematch(): void }

export function RoomScreen({ view, move, rematch }: Props) {
  switch (view.status) {
    case 'starting':
      return <p className={styles.status}>Creating room…</p>
    case 'waiting':
      return (
        <>
          <p className={styles.status}>Waiting for opponent…</p>
          <p>Send this link to a friend:</p>
          <ShareLink url={view.shareUrl} />
        </>
      )
    case 'connecting':
      return <p className={styles.status}>Connecting…</p>
    case 'playing': {
      const { game, me, opponentWantsRematch } = view
      const opponent: Seat = me === 'host' ? 'guest' : 'host'
      const over = game.result.kind !== 'playing'
      const myTurn = !over && game.players[me].mark === game.turn
      return (
        <>
          <div className={styles.players}>
            {[me, opponent].map((seat) => {
              const p = game.players[seat]
              return (
                <div key={seat} className={!over && p.mark === game.turn ? styles.active : styles.player}>
                  <span className={styles.emoji}>{p.emoji}</span> {p.name} {seat === me && '(you)'}
                  <strong className={styles.mark}>{p.mark}</strong>
                </div>
              )
            })}
          </div>
          <p className={styles.status}>{statusLine(game, me)}</p>
          <Board
            board={game.board}
            canMove={myTurn}
            winLine={game.result.kind === 'win' ? game.result.line : undefined}
            onMove={move}
          />
          {over && (
            <div className={styles.rematch}>
              {opponentWantsRematch && <p>Opponent wants a rematch</p>}
              {game.rematchVotes.includes(me) ? (
                <p>Waiting for opponent…</p>
              ) : (
                <button onClick={rematch}>Rematch</button>
              )}
            </div>
          )}
        </>
      )
    }
    case 'ended':
      return <RoomEnded reason={view.reason} />
  }
}

const ENDED_MESSAGES: Record<ClosedReason, string> = {
  'not-found': 'Room not found',
  full: 'Room is full',
  unreachable: "Couldn't connect — your network may block peer-to-peer. Try another network.",
  network: 'Matchmaking server unreachable, try again',
  'create-failed': "Couldn't create a room",
}

export function RoomEnded({ reason }: { reason: ClosedReason }) {
  return (
    <>
      <p className={styles.status}>{ENDED_MESSAGES[reason]}</p>
      <Link to="/">Back to home</Link>
    </>
  )
}

function statusLine(game: GameState, me: Seat): string {
  const { result } = game
  if (result.kind === 'draw') return 'Draw'
  if (result.kind === 'win') return result.mark === game.players[me].mark ? 'You win!' : `${winnerName(game, result.mark)} wins`
  return game.players[me].mark === game.turn ? 'Your turn' : "Opponent's turn"
}

function winnerName(game: GameState, mark: string): string {
  const p = game.players.host.mark === mark ? game.players.host : game.players.guest
  return `${p.emoji} ${p.name}`
}
