import { useNavigate } from 'react-router'
import { GamePicker } from './GamePicker'
import { ProfileForm } from './ProfileForm'

export function HomePage() {
  const navigate = useNavigate()
  return (
    <>
      <h1>Play a friend</h1>
      <p>In your browser. No accounts, no installs.</p>
      <h2>Pick a game</h2>
      <GamePicker />
      <ProfileForm submitLabel="Create room" onSubmit={() => navigate('/room/new')} />
    </>
  )
}
