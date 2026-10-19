import type { Mark, PlayerInfo } from '../room/protocol'

// Both players, with "(you)" against this tab's mark.
export function Players({ players, you }: { players: Record<Mark, PlayerInfo>; you: Mark }) {
  return (
    <main className="screen">
      <h1>Tic-tac-toe</h1>
      <ul className="players">
        {(['X', 'O'] as const).map((mark) => (
          <li key={mark}>
            <span className="player-emoji">{players[mark].emoji}</span>
            <span className="player-name">{players[mark].name}</span>
            <span className="player-mark">
              {mark}
              {mark === you && ' (you)'}
            </span>
          </li>
        ))}
      </ul>
    </main>
  )
}
