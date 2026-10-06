import { useCallback, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { loadProfile, type Profile } from '../profile/profile'
import { useGuestRoom } from '../room/useGuestRoom'
import { useHostRoom } from '../room/useHostRoom'
import { ProfileForm } from './ProfileForm'
import { RoomScreen } from './RoomScreen'

export function RoomPage() {
  const { roomId = '' } = useParams()
  // Host-ness is decided once, on mount: the URL changes from /room/new to
  // /room/<id> under the host, and a reload makes you a guest of that id.
  const [isHost] = useState(() => roomId === 'new')
  // Read once so the room hooks get a stable profile.
  const [profile, setProfile] = useState<Profile | null>(loadProfile)

  if (isHost) return profile ? <HostRoom profile={profile} /> : <Navigate to="/" replace />
  if (!profile) {
    return (
      <>
        <h1>Join a game</h1>
        <p>Tell your opponent who you are.</p>
        <ProfileForm submitLabel="Join" onSubmit={setProfile} />
      </>
    )
  }
  return <GuestRoom roomId={roomId} profile={profile} />
}

function HostRoom({ profile }: { profile: Profile }) {
  const navigate = useNavigate()
  const onOpen = useCallback((id: string) => navigate(`/room/${id}`, { replace: true }), [navigate])
  const { view, move } = useHostRoom(profile, onOpen)
  return <RoomScreen view={view} move={move} />
}

function GuestRoom({ roomId, profile }: { roomId: string; profile: Profile }) {
  const { view, move } = useGuestRoom(roomId, profile)
  return <RoomScreen view={view} move={move} />
}
