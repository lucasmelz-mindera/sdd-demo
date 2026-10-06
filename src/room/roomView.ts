import type { GameState, Seat } from '../game/ticTacToe'

export type RoomView =
  | { status: 'starting' } // host: before peer open
  | { status: 'waiting'; shareUrl: string } // host
  | { status: 'connecting' } // guest
  | { status: 'playing'; game: GameState; me: Seat }
