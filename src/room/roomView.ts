import type { GameState, Seat } from '../game/ticTacToe'
import type { CloseReason } from '../net/session'

export type RoomView =
  | { status: 'starting' } // host: before peer open
  | { status: 'waiting'; shareUrl: string } // host
  | { status: 'connecting' } // guest
  | { status: 'playing'; game: GameState; me: Seat; opponentWantsRematch: boolean }
  | { status: 'ended'; reason: CloseReason }

export function playing(game: GameState, me: Seat): RoomView {
  const opponent: Seat = me === 'host' ? 'guest' : 'host'
  return { status: 'playing', game, me, opponentWantsRematch: game.rematchVotes.includes(opponent) }
}
