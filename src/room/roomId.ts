// No 0/o/1/l/i, so ids are easy to read aloud and type.
export const ROOM_ID_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'
const ROOM_ID_LENGTH = 6
const PEER_ID_PREFIX = 'sdd-ttt-'

const cryptoRandom = (n: number) => crypto.getRandomValues(new Uint8Array(n))

export function generateRoomId(random: (n: number) => Uint8Array = cryptoRandom): string {
  return Array.from(random(ROOM_ID_LENGTH), (byte) => ROOM_ID_ALPHABET[byte % ROOM_ID_ALPHABET.length]).join('')
}

/** What a guest's link becomes before it touches PeerJS; null means "Room not found". */
export function normalizeRoomId(raw: string): string | null {
  const id = raw.trim().toLowerCase()
  return /^[a-z0-9]{6}$/.test(id) ? id : null
}

export function toPeerId(roomId: string): string {
  return PEER_ID_PREFIX + roomId
}

export function shareUrl(roomId: string, origin: string = location.origin): string {
  return `${origin}${import.meta.env.BASE_URL}#/room/${roomId}`
}
