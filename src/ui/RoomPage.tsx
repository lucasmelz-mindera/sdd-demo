import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { GUEST_PLACEHOLDER, HOST_PLACEHOLDER } from '../profile/profile'
import { useGuestRoom } from '../room/useGuestRoom'
import { useHostRoom } from '../room/useHostRoom'
import { RoomScreen } from './RoomScreen'

export function RoomPage() {
  const { roomId = '' } = useParams()
  // Host-ness is decided once, on mount: the URL changes from /room/new to
  // /room/<id> under the host, and a reload makes you a guest of that id.
  const [isHost] = useState(() => roomId === 'new')
  return isHost ? <HostRoom /> : <GuestRoom roomId={roomId} />
}

function HostRoom() {
  const navigate = useNavigate()
  const onOpen = useCallback((id: string) => navigate(`/room/${id}`, { replace: true }), [navigate])
  const { view, move, rematch } = useHostRoom(HOST_PLACEHOLDER, onOpen)
  return <RoomScreen view={view} move={move} rematch={rematch} />
}

function GuestRoom({ roomId }: { roomId: string }) {
  const { view, move, rematch } = useGuestRoom(roomId, GUEST_PLACEHOLDER)
  return <RoomScreen view={view} move={move} rematch={rematch} />
}
