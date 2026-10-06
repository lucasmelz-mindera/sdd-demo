import { useCallback, useEffect, useRef, useState } from 'react'
import { newGame, reduce, type Action, type GameState } from '../game/ticTacToe'
import { hostSession, type Session } from '../net/session'
import { DEFAULT_EMOJI } from '../profile/emojis'
import { sanitizeProfile, type Profile } from '../profile/profile'
import { shareUrl } from './roomId'
import type { RoomView } from './roomView'

/** The host owns the only GameState and broadcasts it in full after every change. */
export function useHostRoom(profile: Profile, onOpen: (roomId: string) => void) {
  const [view, setView] = useState<RoomView>({ status: 'starting' })
  const session = useRef<Session | null>(null)
  const game = useRef<GameState | null>(null)
  const onOpenRef = useRef(onOpen)
  useEffect(() => {
    onOpenRef.current = onOpen
  })

  const apply = useCallback((action: Action) => {
    const current = game.current
    if (!current) return
    const next = reduce(current, action)
    // Same reference = illegal; re-sending the current state resyncs the guest.
    session.current?.send({ type: 'state', state: next })
    if (next === current) return
    game.current = next
    setView({ status: 'playing', game: next, me: 'host' })
  }, [])

  useEffect(() => {
    const s = hostSession((e) => {
      switch (e.type) {
        case 'open':
          setView({ status: 'waiting', shareUrl: shareUrl(e.roomId) })
          onOpenRef.current(e.roomId)
          return
        case 'connected':
          return
        case 'message': {
          const m = e.message
          if (m.type === 'hello' && !game.current) {
            // Never trust the guest's name/emoji as sent; an unusable name gets a stand-in.
            const guest = sanitizeProfile(m) ?? { name: 'Guest', emoji: DEFAULT_EMOJI }
            game.current = newGame(profile, guest)
            s.send({ type: 'hello', name: profile.name, emoji: profile.emoji, game: 'tic-tac-toe' })
            s.send({ type: 'state', state: game.current })
            setView({ status: 'playing', game: game.current, me: 'host' })
          } else if (m.type === 'move') {
            apply({ type: 'move', seat: 'guest', cell: m.cell })
          }
          return
        }
      }
    })
    session.current = s
    return () => {
      s.close()
      session.current = null
      game.current = null
    }
  }, [profile, apply])

  const move = useCallback((cell: number) => apply({ type: 'move', seat: 'host', cell }), [apply])
  return { view, move }
}
