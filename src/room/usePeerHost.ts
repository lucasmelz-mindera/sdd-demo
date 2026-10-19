import Peer, { type DataConnection, type PeerError } from 'peerjs'
import { useEffect, useRef, useState } from 'react'
import { hostReducer, initialHostState, type HostEvent, type HostState } from './hostSession'
import { isConnectionError } from './peerErrors'
import { isGuestMessage, type PlayerInfo } from './protocol'
import { generateRoomId, shareLink, toPeerId } from './roomId'

const MAX_ID_ATTEMPTS = 3

export type HostStatus = 'opening' | 'waiting' | 'playing' | 'result' | 'error'

export type PeerHost = {
  status: HostStatus
  roomId: string | null
  shareLink: string | null
  game: HostState
  move: (cell: number) => void
}

// Owns the host's Peer: opens it under a fresh room ID (retrying on a taken ID),
// seats the first guest and drives `hostReducer`. `onOpen` fires once the room exists.
export function usePeerHost(player: PlayerInfo, onOpen: (roomId: string) => void): PeerHost {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [game, setGame] = useState(() => initialHostState(player))
  const dispatchRef = useRef<(event: HostEvent) => void>(() => {})

  useEffect(() => {
    let peer: Peer | null = null
    let guestConn: DataConnection | null = null
    let state = initialHostState(player)

    // Events from a destroyed Peer (StrictMode's first mount, a retried ID) are ignored.
    const live = (p: Peer) => p === peer && !p.destroyed

    const dispatch = (event: HostEvent) => {
      const step = hostReducer(state, event)
      state = step.state
      setGame(state)
      for (const message of step.outgoing) guestConn?.send(message)
    }
    dispatchRef.current = dispatch

    const open = (attempt: number) => {
      const id = generateRoomId()
      const p = new Peer(toPeerId(id))
      peer = p

      p.on('open', () => {
        if (!live(p)) return
        setRoomId(id)
        onOpen(id)
      })

      p.on('error', (err: PeerError<string>) => {
        if (!live(p)) return
        if (err.type === 'unavailable-id' && attempt < MAX_ID_ATTEMPTS) {
          p.destroy()
          open(attempt + 1)
        } else if (err.type === 'unavailable-id' || isConnectionError(err.type)) {
          setFailed(true)
        }
      })

      p.on('connection', (conn) => {
        if (!live(p)) return
        if (guestConn) {
          conn.on('open', () => conn.close())
          return
        }
        guestConn = conn
        conn.on('data', (data) => {
          if (!live(p) || conn !== guestConn || !isGuestMessage(data)) return
          if (data.type === 'hello') dispatch({ type: 'guestHello', player: { name: data.name, emoji: data.emoji } })
          else if (data.type === 'move') dispatch({ type: 'guestMove', cell: data.cell })
        })
      })
    }

    open(1)
    return () => {
      peer?.destroy()
      peer = null
    }
    // The room lives for as long as this component; player and onOpen are read once.
  }, [])

  const status: HostStatus = failed ? 'error' : roomId === null ? 'opening' : game.phase
  const move = (cell: number) => dispatchRef.current({ type: 'hostMove', cell })
  return { status, roomId, shareLink: roomId && shareLink(roomId), game, move }
}
