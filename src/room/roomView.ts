import type { GameState, Seat } from '../game/ticTacToe'

export type RoomView =
  | { status: 'starting' } // host: before peer open
  | { status: 'waiting'; shareUrl: string } // host
  | { status: 'connecting' } // guest
  | { status: 'playing'; game: GameState; me: Seat; opponentWantsRematch: boolean }

export function playing(game: GameState, me: Seat): RoomView {
  const opponent: Seat = me === 'host' ? 'guest' : 'host'
  return { status: 'playing', game, me, opponentWantsRematch: game.rematchVotes.includes(opponent) }
}
