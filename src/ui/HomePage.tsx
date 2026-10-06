import { useNavigate } from 'react-router'
import styles from './HomePage.module.css'

export function HomePage() {
  const navigate = useNavigate()
  return (
    <>
      <h1>Tic-tac-toe</h1>
      <p>Play a friend in your browser. No accounts, no installs.</p>
      <button className={styles.create} onClick={() => navigate('/room/new')}>
        Create room
      </button>
    </>
  )
}
