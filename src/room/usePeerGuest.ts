import Peer, { type DataConnection, type PeerError } from 'peerjs'
import { useEffect, useRef, useState } from 'react'
import { isHostMessage, type GuestMessage, type PlayerInfo, type StateMessage } from './protocol'
import { toPeerId } from './roomId'

const CONNECT_TIMEOUT_MS = 10_000

const FATAL_PEER_ERRORS = ['network', 'server-error', 'socket-error', 'socket-closed', 'browser-incompatible', 'webrtc']

export type GuestStatus = 'connecting' | 'playing' | 'not-found' | 'error'

export type PeerGuest = { status: GuestStatus; state: StateMessage | null; move: (cell: number) => void }

// Owns the guest's Peer: connects to the room's host, says hello and keeps the latest `state`.
export function usePeerGuest(roomId: string, player: PlayerInfo): PeerGuest {
  const [status, setStatus] = useState<GuestStatus>('connecting')
  const [state, setState] = useState<StateMessage | null>(null)
  const connRef = useRef<DataConnection | null>(null)

  useEffect(() => {
    // An explicit ID: with none, PeerJS fetches one over HTTP and still opens its socket
    // if destroyed meanwhile, which leaks a Peer under StrictMode.
    const peer = new Peer(`sdd-ttt-guest-${crypto.randomUUID()}`)
    let connected = false
    const live = () => !peer.destroyed

    const timeout = setTimeout(() => {
      if (live() && !connected) setStatus('error')
    }, CONNECT_TIMEOUT_MS)

    peer.on('open', () => {
      if (!live()) return
      const conn = peer.connect(toPeerId(roomId), { serialization: 'json', reliable: true })
      conn.on('open', () => {
        if (!live()) return
        connected = true
        connRef.current = conn
        const hello: GuestMessage = { type: 'hello', name: player.name, emoji: player.emoji }
        conn.send(hello)
      })
      conn.on('data', (data) => {
        if (!live() || !isHostMessage(data)) return
        if (data.type === 'state') {
          setState(data)
          setStatus('playing')
        }
      })
      conn.on('error', (err) => {
        if (live() && err.type === 'negotiation-failed') setStatus('error')
      })
    })

    peer.on('error', (err: PeerError<string>) => {
      if (!live()) return
      if (err.type === 'peer-unavailable') setStatus('not-found')
      else if (FATAL_PEER_ERRORS.includes(err.type)) setStatus('error')
    })

    return () => {
      clearTimeout(timeout)
      connRef.current = null
      peer.destroy()
    }
  }, [roomId, player])

  // A move is only an intent: the board changes when the host answers with `state`.
  const move = (cell: number) => {
    const message: GuestMessage = { type: 'move', cell }
    connRef.current?.send(message)
  }
  return { status, state, move }
}
