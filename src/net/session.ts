// The only file that imports peerjs. It turns PeerJS into a small typed event
// API and hides peer ids, serialization, retries and the join timeout.
import { Peer, type DataConnection, type PeerError } from 'peerjs'
import { generateRoomId, toPeerId } from '../room/roomId'
import { parseMessage, type Message } from './protocol'

export type ClosedReason = 'not-found' | 'full' | 'network' | 'unreachable' | 'create-failed'

export type SessionEvent =
  | { type: 'open'; roomId: string } // host: room is live, show share link
  | { type: 'connected' } // channel open (guest: send hello)
  | { type: 'message'; message: Message } // already parsed; malformed dropped here
  | { type: 'closed'; reason: ClosedReason } // final; nothing follows it

export type Session = { send(m: Message): void; close(): void }

const MAX_CREATE_RETRIES = 5
const JOIN_TIMEOUT_MS = 120_000
// Losing the matchmaking server only matters before the peers are connected.
const CLOUD_ERRORS = new Set(['network', 'server-error', 'socket-error', 'socket-closed'])

export function hostSession(onEvent: (e: SessionEvent) => void): Session {
  const channel = createChannel(onEvent)
  let retries = 0

  const start = () => {
    const roomId = generateRoomId()
    const peer = new Peer(toPeerId(roomId))
    channel.setPeer(peer)
    peer.on('open', () => channel.emit({ type: 'open', roomId }))
    peer.on('connection', (conn) => {
      // The seat is taken once a guest's channel opens; until then a newcomer
      // replaces a guest who stalled or left mid-handshake.
      if (channel.isConnected()) turnAway(conn)
      else channel.attach(conn)
    })
    peer.on('error', (err: PeerError<string>) => {
      if (err.type === 'unavailable-id') {
        // Someone holds this id; a fresh one almost certainly isn't taken.
        peer.destroy()
        if (channel.isClosed()) return
        if (retries++ < MAX_CREATE_RETRIES) start()
        else channel.end('create-failed')
      } else if (CLOUD_ERRORS.has(err.type) && !channel.isConnected()) {
        channel.end('network')
      }
    })
  }
  start()
  return channel.session
}

export function joinSession(roomId: string, onEvent: (e: SessionEvent) => void): Session {
  // The cloud reports a missing host in ~5 s; this catches a connection that stalls.
  const timeout = setTimeout(() => channel.end('not-found'), JOIN_TIMEOUT_MS)
  const channel = createChannel((e) => {
    if (e.type === 'connected' || e.type === 'closed') clearTimeout(timeout)
    onEvent(e)
  })
  const peer = new Peer()
  channel.setPeer(peer)

  peer.on('open', () => {
    channel.attach(peer.connect(toPeerId(roomId), { serialization: 'json', reliable: true }))
  })
  peer.on('error', (err: PeerError<string>) => {
    if (err.type === 'peer-unavailable') channel.end('not-found')
    else if (CLOUD_ERRORS.has(err.type) && !channel.isConnected()) channel.end('network')
  })
  return {
    send: channel.session.send,
    close() {
      clearTimeout(timeout)
      channel.session.close()
    },
  }
}

/** Tell a late guest the room is taken, then hang up once the message is out. */
function turnAway(conn: DataConnection) {
  conn.on('open', () => {
    conn.send({ type: 'full' } satisfies Message)
    conn.close({ flush: true })
  })
}

function createChannel(onEvent: (e: SessionEvent) => void) {
  let peer: Peer | null = null
  let conn: DataConnection | null = null
  let connected = false
  let closed = false

  const emit = (e: SessionEvent) => {
    if (!closed) onEvent(e)
  }
  const finish = () => {
    if (closed) return
    closed = true
    peer?.destroy()
  }
  const end = (reason: ClosedReason) => {
    emit({ type: 'closed', reason })
    finish()
  }

  return {
    emit,
    end,
    setPeer: (p: Peer) => (peer = p),
    isConnected: () => connected,
    isClosed: () => closed,
    attach(c: DataConnection) {
      conn?.close()
      conn = c
      // A replaced connection's late events are not ours any more.
      const current = () => conn === c
      c.on('open', () => {
        if (!current()) return
        connected = true
        emit({ type: 'connected' })
      })
      c.on('data', (data) => {
        if (!current()) return
        const message = parseMessage(data)
        if (message?.type === 'full') end('full')
        else if (message) emit({ type: 'message', message })
      })
      c.on('error', (err: PeerError<string>) => {
        if (current() && err.type === 'negotiation-failed') end('unreachable')
      })
    },
    session: {
      send(m: Message) {
        if (conn?.open) conn.send(m)
      },
      close: finish,
    },
  }
}
