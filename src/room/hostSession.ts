import { applyMove, emptyBoard, type Board, type Mark, type Result } from '../game/ticTacToe'
import { normalizePlayer } from './player'
import type { HostMessage, PlayerInfo, StateMessage } from './protocol'

export type HostPhase = 'waiting' | 'playing' | 'result'

export type HostState = {
  phase: HostPhase
  host: PlayerInfo
  guest: PlayerInfo | null
  board: Board
  turn: Mark
  hostMark: Mark
  result: Result
}

export type HostEvent =
  | { type: 'guestHello'; player: PlayerInfo }
  | { type: 'guestMove'; cell: number }
  | { type: 'hostMove'; cell: number }

export type HostStep = { state: HostState; outgoing: HostMessage[] }

export function initialHostState(host: PlayerInfo): HostState {
  return { phase: 'waiting', host, guest: null, board: emptyBoard(), turn: 'X', hostMark: 'X', result: null }
}

export function guestMark(state: HostState): Mark {
  return state.hostMark === 'X' ? 'O' : 'X'
}

export function hostReducer(state: HostState, event: HostEvent): HostStep {
  switch (event.type) {
    case 'guestHello': {
      const guest = normalizePlayer(event.player)
      if (!guest) return { state, outgoing: [] }
      const next: HostState = { ...state, phase: 'playing', guest }
      return { state: next, outgoing: [toStateMessage(next)] }
    }
    case 'guestMove': {
      if (state.phase === 'waiting') return { state, outgoing: [] }
      const next = move(state, guestMark(state), event.cell)
      // An invalid move is answered with the unchanged state, so the guest resyncs.
      return { state: next ?? state, outgoing: [toStateMessage(next ?? state)] }
    }
    case 'hostMove': {
      const next = move(state, state.hostMark, event.cell)
      return next ? { state: next, outgoing: [toStateMessage(next)] } : { state, outgoing: [] }
    }
  }
}

// `mark` plays `cell`, or null when it isn't their turn or the move is illegal.
function move(state: HostState, mark: Mark, cell: number): HostState | null {
  if (state.phase !== 'playing' || state.turn !== mark) return null
  const step = applyMove(state.board, mark, cell)
  if (!step) return null
  return { ...state, ...step, phase: step.result === null ? 'playing' : 'result' }
}

// The `state` message as the guest sees it.
export function toStateMessage(state: HostState): StateMessage {
  const guest = state.guest ?? { name: '', emoji: '' }
  return {
    type: 'state',
    board: state.board,
    turn: state.turn,
    players: state.hostMark === 'X' ? { X: state.host, O: guest } : { X: guest, O: state.host },
    you: guestMark(state),
    result: state.result,
    rematch: { X: false, O: false },
  }
}
