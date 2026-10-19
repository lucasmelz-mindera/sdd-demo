export function GamePicker({ onPick }: { onPick: (game: 'tic-tac-toe') => void }) {
  return (
    <main className="screen">
      <h1>Pick a game</h1>
      <div className="games">
        <button className="game-card" onClick={() => onPick('tic-tac-toe')}>
          <span className="game-icon">❌⭕</span>
          <span className="game-name">Tic-tac-toe</span>
        </button>
        <button className="game-card" disabled>
          <span className="game-icon">⚫⚪</span>
          <span className="game-name">Checkers</span>
          <span className="game-badge">Coming soon</span>
        </button>
      </div>
    </main>
  )
}
