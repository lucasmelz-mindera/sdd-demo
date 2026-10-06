import type { GameState } from '../game/ticTacToe'

export type Message =
  | { type: 'hello'; name: string; emoji: string; game?: 'tic-tac-toe' } // host's hello carries game
  | { type: 'move'; cell: number }
  | { type: 'rematch' }
  | { type: 'state'; state: GameState }
  | { type: 'full' } // host → a guest who arrived after the room filled
  | { type: 'ping' }
  | { type: 'leave' }

/** Shape checks only; whether a move is legal is the reducer's job. */
export function parseMessage(data: unknown): Message | null {
  if (!isRecord(data)) return null
  switch (data.type) {
    case 'hello':
      return isString(data.name) && isString(data.emoji) && (data.game === undefined || data.game === 'tic-tac-toe')
        ? (data as Message)
        : null
    case 'move':
      return isCellIndex(data.cell) ? (data as Message) : null
    case 'rematch':
      return { type: 'rematch' }
    case 'state':
      return isGameState(data.state) ? (data as Message) : null
    case 'full':
      return { type: 'full' }
    case 'ping':
      return { type: 'ping' }
    case 'leave':
      return { type: 'leave' }
    default:
      return null
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isString = (v: unknown): v is string => typeof v === 'string'
const isMark = (v: unknown) => v === 'X' || v === 'O'
const isSeat = (v: unknown) => v === 'host' || v === 'guest'
const isCellIndex = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 8

function isPlayer(v: unknown): boolean {
  return isRecord(v) && isString(v.name) && isString(v.emoji) && isMark(v.mark)
}

function isResult(v: unknown): boolean {
  if (!isRecord(v)) return false
  switch (v.kind) {
    case 'playing':
    case 'draw':
      return true
    case 'win':
      return isMark(v.mark) && Array.isArray(v.line) && v.line.length === 3 && v.line.every(isCellIndex)
    default:
      return false
  }
}

function isGameState(v: unknown): v is GameState {
  return (
    isRecord(v) &&
    isRecord(v.players) &&
    isPlayer(v.players.host) &&
    isPlayer(v.players.guest) &&
    Array.isArray(v.board) &&
    v.board.length === 9 &&
    v.board.every((c) => c === null || isMark(c)) &&
    isMark(v.turn) &&
    isResult(v.result) &&
    Array.isArray(v.rematchVotes) &&
    v.rematchVotes.every(isSeat)
  )
}
