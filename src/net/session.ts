// The only file that imports peerjs. It turns PeerJS into a small typed event
// API and hides peer ids, serialization and the heartbeat.
import { Peer, type DataConnection } from 'peerjs'
import { generateRoomId, toPeerId } from '../room/roomId'
import { createHeartbeat, type Heartbeat } from './heartbeat'
import { parseMessage, type Message } from './protocol'

export type CloseReason = 'left' | 'timeout'

export type SessionEvent =
  | { type: 'open'; roomId: string } // host: room is live, show share link
  | { type: 'connected' } // channel open (guest: send hello)
  | { type: 'message'; message: Message } // already parsed; malformed, ping and leave dropped here
  | { type: 'closed'; reason: CloseReason } // the room is over; the session is already torn down

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
  let heartbeat: Heartbeat | null = null
  let closed = false
  const emit = (e: SessionEvent) => {
    if (!closed) onEvent(e)
  }
  const send = (m: Message) => {
    if (conn?.open) conn.send(m)
  }

  // `close` alone can't be trusted to fire, so a tab going away also says so
  // in-band and destroys the peer to tear the channel down promptly.
  function close() {
    if (closed) return
    send({ type: 'leave' })
    shutdown()
  }

  function end(reason: CloseReason) {
    if (closed) return
    emit({ type: 'closed', reason })
    shutdown()
  }

  function shutdown() {
    closed = true
    heartbeat?.stop()
    window.removeEventListener('pagehide', close)
    peer.destroy()
  }

  window.addEventListener('pagehide', close)

  return {
    emit,
    hasConnection: () => conn !== null,
    attach(c: DataConnection) {
      conn = c
      c.on('open', () => {
        heartbeat = createHeartbeat({ send: () => send({ type: 'ping' }), onTimeout: () => end('timeout') })
        emit({ type: 'connected' })
      })
      c.on('data', (data) => {
        heartbeat?.seen() // any message counts as proof of life
        const message = parseMessage(data)
        if (message?.type === 'leave') end('left')
        else if (message && message.type !== 'ping') emit({ type: 'message', message })
      })
      c.on('close', () => end('left'))
    },
    session: { send, close },
  }
}
