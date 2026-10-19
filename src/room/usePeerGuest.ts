import Peer, { type DataConnection, type PeerError } from 'peerjs'
import { useEffect, useRef, useState } from 'react'
import { isHostMessage, type GuestMessage, type PlayerInfo, type StateMessage } from './protocol'
import { isConnectionError } from './peerErrors'
import { toPeerId } from './roomId'

const CONNECT_TIMEOUT_MS = 10_000

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
    let failed = false
    const live = () => !peer.destroyed

    // The first failure sticks: a later timeout must not turn "Room not found" into an error.
    const fail = (outcome: 'not-found' | 'error') => {
      if (!live() || failed) return
      failed = true
      setStatus(outcome)
    }

    const timeout = setTimeout(() => {
      if (!connected) fail('error')
    }, CONNECT_TIMEOUT_MS)

    peer.on('open', () => {
      if (!live()) return
      const conn = peer.connect(toPeerId(roomId), { serialization: 'json', reliable: true })
      conn.on('open', () => {
        if (!live() || failed) return
        connected = true
        connRef.current = conn
        const hello: GuestMessage = { type: 'hello', name: player.name, emoji: player.emoji }
        conn.send(hello)
      })
      conn.on('data', (data) => {
        if (!live() || failed || !isHostMessage(data)) return
        if (data.type === 'state') {
          setState(data)
          setStatus('playing')
        }
      })
      conn.on('error', (err) => {
        if (isConnectionError(err.type)) fail('error')
      })
    })

    peer.on('error', (err: PeerError<string>) => {
      if (err.type === 'peer-unavailable') fail('not-found')
      else if (isConnectionError(err.type)) fail('error')
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
