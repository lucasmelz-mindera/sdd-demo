import { useCallback, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { loadProfile, type Profile } from '../profile/profile'
import { normalizeRoomId } from '../room/roomId'
import { useGuestRoom } from '../room/useGuestRoom'
import { useHostRoom } from '../room/useHostRoom'
import { ProfileForm } from './ProfileForm'
import { RoomEnded, RoomScreen } from './RoomScreen'

export function RoomPage() {
  const { roomId = '' } = useParams()
  // Host-ness is decided once, on mount: the URL changes from /room/new to
  // /room/<id> under the host, and a reload makes you a guest of that id.
  const [isHost] = useState(() => roomId === 'new')
  // Read once so the room hooks get a stable profile.
  const [profile, setProfile] = useState<Profile | null>(loadProfile)

  if (isHost) return profile ? <HostRoom profile={profile} /> : <Navigate to="/" replace />
  // A malformed id can't be a room, so don't ask PeerJS about it.
  const id = normalizeRoomId(roomId)
  if (!id) return <RoomEnded reason="not-found" />
  if (!profile) {
    return (
      <>
        <h1>Join a game</h1>
        <p>Tell your opponent who you are.</p>
        <ProfileForm submitLabel="Join" onSubmit={setProfile} />
      </>
    )
  }
  return <GuestRoom roomId={id} profile={profile} />
}

function HostRoom({ profile }: { profile: Profile }) {
  const navigate = useNavigate()
  const onOpen = useCallback((id: string) => navigate(`/room/${id}`, { replace: true }), [navigate])
  const { view, move, rematch } = useHostRoom(profile, onOpen)
  return <RoomScreen view={view} move={move} rematch={rematch} />
}

function GuestRoom({ roomId, profile }: { roomId: string; profile: Profile }) {
  const { view, move, rematch } = useGuestRoom(roomId, profile)
  return <RoomScreen view={view} move={move} rematch={rematch} />
}
