import { useEffect, useState } from 'react'
import type { PlayerInfo } from '../room/protocol'
import { roomHash, type Route } from '../room/roomId'
import { usePeerGuest } from '../room/usePeerGuest'
import { usePeerHost } from '../room/usePeerHost'
import { GamePicker } from '../ui/GamePicker'
import { GameScreen } from '../ui/GameScreen'
import { Lobby } from '../ui/Lobby'
import { PlayerSetup } from '../ui/PlayerSetup'
import { StatusScreen } from '../ui/StatusScreen'
import { navigate, useHashRoute } from './useHashRoute'

type Hosting = { player: PlayerInfo; roomId: string | null }

// The host's room is created on `#/` and keeps running once the hash moves to the room.
function isHostingRoute(hosting: Hosting, route: Route) {
  return hosting.roomId === null ? route.kind === 'picker' : route.kind === 'room' && route.id === hosting.roomId
}

export function App() {
  const route = useHashRoute()
  const [hosting, setHosting] = useState<Hosting | null>(null)
  const stillHosting = hosting !== null && isHostingRoute(hosting, route)

  useEffect(() => {
    if (hosting && !stillHosting) setHosting(null)
  }, [hosting, stillHosting])

  if (hosting && stillHosting) {
    return (
      <HostRoom
        player={hosting.player}
        onOpen={(roomId) => {
          setHosting({ player: hosting.player, roomId })
          navigate(roomHash(roomId))
        }}
      />
    )
  }

  switch (route.kind) {
    case 'picker':
      return <Home onCreate={(player) => setHosting({ player, roomId: null })} />
    case 'room':
      return <GuestRoom key={route.id} roomId={route.id} />
    case 'bad-link':
      return <StatusScreen title="Bad link" message="This room link doesn't look right." />
  }
}

function Home({ onCreate }: { onCreate: (player: PlayerInfo) => void }) {
  const [picked, setPicked] = useState(false)
  if (!picked) return <GamePicker onPick={() => setPicked(true)} />
  return <PlayerSetup title="Tic-tac-toe" submitLabel="Create room" onSubmit={onCreate} />
}

function HostRoom({ player, onOpen }: { player: PlayerInfo; onOpen: (roomId: string) => void }) {
  const { status, shareLink, game, move } = usePeerHost(player, onOpen)
  switch (status) {
    case 'opening':
      return <StatusScreen title="Creating room…" />
    case 'error':
      return <StatusScreen title="Connection error" message="Couldn't reach the game server." />
    case 'waiting':
      return <Lobby shareLink={shareLink!} />
    case 'playing':
    case 'result':
      return (
        <GameScreen
          board={game.board}
          turn={game.turn}
          result={game.result}
          players={game.hostMark === 'X' ? { X: game.host, O: game.guest! } : { X: game.guest!, O: game.host }}
          you={game.hostMark}
          onMove={move}
        />
      )
  }
}

function GuestRoom({ roomId }: { roomId: string }) {
  const [player, setPlayer] = useState<PlayerInfo | null>(null)
  if (!player) return <PlayerSetup title="Join tic-tac-toe" submitLabel="Join room" onSubmit={setPlayer} />
  return <GuestConnection roomId={roomId} player={player} />
}

function GuestConnection({ roomId, player }: { roomId: string; player: PlayerInfo }) {
  const { status, state, move } = usePeerGuest(roomId, player)
  switch (status) {
    case 'connecting':
      return <StatusScreen title="Connecting…" />
    case 'not-found':
      return <StatusScreen title="Room not found" message="Nobody is hosting this room." />
    case 'error':
      return <StatusScreen title="Connection error" message="Couldn't connect to the room." />
    case 'playing':
      return <GameScreen board={state!.board} turn={state!.turn} result={state!.result} players={state!.players} you={state!.you} onMove={move} />
  }
}
