import { useCallback, useEffect, useRef, useState } from 'react'
import { joinSession, type Session } from '../net/session'
import type { Profile } from '../profile/profile'
import type { RoomView } from './roomView'

/** The guest only sends intents and renders whatever state the host sends. */
export function useGuestRoom(roomId: string, profile: Profile) {
  const [view, setView] = useState<RoomView>({ status: 'connecting' })
  const session = useRef<Session | null>(null)

  useEffect(() => {
    const s = joinSession(roomId, (e) => {
      if (e.type === 'connected') {
        s.send({ type: 'hello', name: profile.name, emoji: profile.emoji })
      } else if (e.type === 'message' && e.message.type === 'state') {
        setView({ status: 'playing', game: e.message.state, me: 'guest' })
      }
    })
    session.current = s
    return () => {
      s.close()
      session.current = null
    }
  }, [roomId, profile])

  const move = useCallback((cell: number) => session.current?.send({ type: 'move', cell }), [])
  return { view, move }
}
