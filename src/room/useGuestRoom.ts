import { useCallback, useEffect, useRef, useState } from 'react'
import { joinSession, type Session } from '../net/session'
import type { Profile } from '../profile/profile'
import { playing, type RoomView } from './roomView'

/** The guest only sends intents and renders whatever state the host sends. */
export function useGuestRoom(roomId: string, profile: Profile) {
  const [view, setView] = useState<RoomView>({ status: 'connecting' })
  const session = useRef<Session | null>(null)

  useEffect(() => {
    const s = joinSession(roomId, (e) => {
      if (e.type === 'connected') {
        s.send({ type: 'hello', name: profile.name, emoji: profile.emoji })
      } else if (e.type === 'message' && e.message.type === 'state') {
        setView(playing(e.message.state, 'guest'))
      } else if (e.type === 'closed') {
        setView({ status: 'ended', reason: e.reason })
      }
    })
    session.current = s
    return () => {
      s.close()
      session.current = null
    }
  }, [roomId, profile])

  const move = useCallback((cell: number) => session.current?.send({ type: 'move', cell }), [])
  const rematch = useCallback(() => session.current?.send({ type: 'rematch' }), [])
  return { view, move, rematch }
}
