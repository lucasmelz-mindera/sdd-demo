import type { Seat } from '../game/ticTacToe'
import type { RoomView } from '../room/roomView'
import { Board } from './Board'
import styles from './RoomScreen.module.css'
import { ShareLink } from './ShareLink'

type Props = { view: RoomView; move(cell: number): void }

export function RoomScreen({ view, move }: Props) {
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
      const { game, me } = view
      const opponent: Seat = me === 'host' ? 'guest' : 'host'
      const myTurn = game.players[me].mark === game.turn
      return (
        <>
          <div className={styles.players}>
            {[me, opponent].map((seat) => {
              const p = game.players[seat]
              return (
                <div key={seat} className={p.mark === game.turn ? styles.active : styles.player}>
                  <span className={styles.emoji}>{p.emoji}</span> {p.name} {seat === me && '(you)'}
                  <strong className={styles.mark}>{p.mark}</strong>
                </div>
              )
            })}
          </div>
          <p className={styles.status}>{myTurn ? 'Your turn' : "Opponent's turn"}</p>
          <Board board={game.board} canMove={myTurn} onMove={move} />
        </>
      )
    }
  }
}
