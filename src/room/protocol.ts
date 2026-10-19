import type { Cell, Mark, Result } from '../game/ticTacToe'

export type { Cell, Mark }

export type PlayerInfo = { name: string; emoji: string }

export type StateMessage = {
  type: 'state'
  board: Cell[]
  turn: Mark
  players: Record<Mark, PlayerInfo>
  you: Mark
  result: Result
  rematch: Record<Mark, boolean>
}

export type GuestMessage =
  | { type: 'hello'; name: string; emoji: string }
  | { type: 'move'; cell: number }
  | { type: 'rematch' }
  | { type: 'ping' }

export type HostMessage = StateMessage | { type: 'full' } | { type: 'ping' }

export const HEARTBEAT_INTERVAL_MS = 2000
export const HEARTBEAT_TIMEOUT_MS = 6000

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

export function isGuestMessage(x: unknown): x is GuestMessage {
  if (!isObject(x)) return false
  switch (x.type) {
    case 'hello':
      return typeof x.name === 'string' && typeof x.emoji === 'string'
    case 'move':
      return Number.isInteger(x.cell) && (x.cell as number) >= 0 && (x.cell as number) <= 8
    case 'rematch':
    case 'ping':
      return true
    default:
      return false
  }
}

export function isHostMessage(x: unknown): x is HostMessage {
  if (!isObject(x)) return false
  switch (x.type) {
    case 'state':
      return Array.isArray(x.board) && isObject(x.players) && (x.you === 'X' || x.you === 'O')
    case 'full':
    case 'ping':
      return true
    default:
      return false
  }
}
