// Lowercase alphanumerics without the look-alikes 0, o, 1 and l.
export const ROOM_ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'
const ROOM_ID_LENGTH = 6
const ROOM_ID_PATTERN = new RegExp(`^[${ROOM_ID_ALPHABET}]{${ROOM_ID_LENGTH}}$`)

export type Game = 'tic-tac-toe'

export type Route = { kind: 'picker' } | { kind: 'room'; game: Game; id: string } | { kind: 'bad-link' }

export function generateRoomId(random: () => number = Math.random): string {
  let id = ''
  for (let i = 0; i < ROOM_ID_LENGTH; i++) {
    id += ROOM_ID_ALPHABET[Math.floor(random() * ROOM_ID_ALPHABET.length)]
  }
  return id
}

export function isValidRoomId(s: string): boolean {
  return ROOM_ID_PATTERN.test(s)
}

export function toPeerId(id: string): string {
  return `sdd-ttt-${id}`
}

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '')
  if (path === '' || path === '/') return { kind: 'picker' }
  const match = /^\/tic-tac-toe\/([^/]*)$/.exec(path)
  if (match && isValidRoomId(match[1])) return { kind: 'room', game: 'tic-tac-toe', id: match[1] }
  return { kind: 'bad-link' }
}

export function roomHash(id: string): string {
  return `#/tic-tac-toe/${id}`
}

export function shareLink(id: string): string {
  return location.origin + import.meta.env.BASE_URL + roomHash(id)
}
