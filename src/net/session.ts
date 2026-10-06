// The only file that imports peerjs. It turns PeerJS into a small typed event
// API and hides peer ids and serialization. Happy path only for now.
import { Peer, type DataConnection } from 'peerjs'
import { generateRoomId, toPeerId } from '../room/roomId'
import { parseMessage, type Message } from './protocol'

export type SessionEvent =
  | { type: 'open'; roomId: string } // host: room is live, show share link
  | { type: 'connected' } // channel open (guest: send hello)
  | { type: 'message'; message: Message } // already parsed; malformed dropped here

export type Session = { send(m: Message): void; close(): void }

export function hostSession(onEvent: (e: SessionEvent) => void): Session {
  const roomId = generateRoomId()
  const peer = new Peer(toPeerId(roomId))
  const channel = createChannel(peer, onEvent)

  peer.on('open', () => channel.emit({ type: 'open', roomId }))
  peer.on('connection', (conn) => {
    // First guest is kept; turning later ones away comes with the "Room is full" ticket.
    if (channel.hasConnection()) conn.close()
    else channel.attach(conn)
  })
  return channel.session
}

export function joinSession(roomId: string, onEvent: (e: SessionEvent) => void): Session {
  const peer = new Peer()
  const channel = createChannel(peer, onEvent)

  peer.on('open', () => {
    channel.attach(peer.connect(toPeerId(roomId), { serialization: 'json', reliable: true }))
  })
  return channel.session
}

function createChannel(peer: Peer, onEvent: (e: SessionEvent) => void) {
  let conn: DataConnection | null = null
  let closed = false
  const emit = (e: SessionEvent) => {
    if (!closed) onEvent(e)
  }

  return {
    emit,
    hasConnection: () => conn !== null,
    attach(c: DataConnection) {
      conn = c
      c.on('open', () => emit({ type: 'connected' }))
      c.on('data', (data) => {
        const message = parseMessage(data)
        if (message) emit({ type: 'message', message })
      })
    },
    session: {
      send(m: Message) {
        if (conn?.open) conn.send(m)
      },
      close() {
        if (closed) return
        closed = true
        peer.destroy()
      },
    },
  }
}
