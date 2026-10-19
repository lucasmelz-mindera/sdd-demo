import type { Mark, PlayerInfo } from '../room/protocol'

// Both players, with "(you)" against this tab's mark and the player to move highlighted.
export function Players({ players, you, turn }: { players: Record<Mark, PlayerInfo>; you: Mark; turn: Mark | null }) {
  return (
    <ul className="players">
      {(['X', 'O'] as const).map((mark) => (
        <li key={mark} className={mark === turn ? 'to-move' : undefined}>
          <span className="player-emoji">{players[mark].emoji}</span>
          <span className="player-name">{players[mark].name}</span>
          <span className="player-mark">
            {mark}
            {mark === you && ' (you)'}
          </span>
        </li>
      ))}
    </ul>
  )
}
