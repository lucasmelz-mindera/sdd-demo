import styles from './GamePicker.module.css'

/** Tic-tac-toe is the only playable game; checkers is a teaser. */
export function GamePicker() {
  return (
    <div className={styles.picker} role="group" aria-label="Game">
      <button type="button" className={styles.chosen} aria-pressed="true">
        <span className={styles.icon}>⭕</span>
        Tic-tac-toe
      </button>
      <button type="button" className={styles.card} disabled>
        <span className={styles.icon}>🏁</span>
        Checkers
        <small className={styles.soon}>Coming soon</small>
      </button>
    </div>
  )
}
