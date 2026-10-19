import { normalizePlayer } from './player'
import type { Cell, HostMessage, Mark, PlayerInfo, StateMessage } from './protocol'

export type HostPhase = 'waiting' | 'playing'

export type HostState = {
  phase: HostPhase
  host: PlayerInfo
  guest: PlayerInfo | null
  board: Cell[]
  turn: Mark
  hostMark: Mark
}

export type HostEvent = { type: 'guestHello'; player: PlayerInfo }

export type HostStep = { state: HostState; outgoing: HostMessage[] }

export function initialHostState(host: PlayerInfo): HostState {
  return { phase: 'waiting', host, guest: null, board: Array(9).fill(null), turn: 'X', hostMark: 'X' }
}

export function hostReducer(state: HostState, event: HostEvent): HostStep {
  switch (event.type) {
    case 'guestHello': {
      const guest = normalizePlayer(event.player)
      if (!guest) return { state, outgoing: [] }
      const next: HostState = { ...state, phase: 'playing', guest }
      return { state: next, outgoing: [toStateMessage(next)] }
    }
  }
}

// The `state` message as the guest sees it.
export function toStateMessage(state: HostState): StateMessage {
  const guestMark: Mark = state.hostMark === 'X' ? 'O' : 'X'
  const guest = state.guest ?? { name: '', emoji: '' }
  return {
    type: 'state',
    board: state.board,
    turn: state.turn,
    players: state.hostMark === 'X' ? { X: state.host, O: guest } : { X: guest, O: state.host },
    you: guestMark,
    result: null,
    rematch: { X: false, O: false },
  }
}
