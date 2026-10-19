// `onHome` runs when the link is followed, for screens that are already on `#/`,
// where the link alone wouldn't fire a `hashchange`.
export function StatusScreen({ title, message, onHome }: { title: string; message?: string; onHome?: () => void }) {
  return (
    <main className="screen">
      <h1>{title}</h1>
      {message && <p>{message}</p>}
      <a href="#/" onClick={onHome}>
        Back home
      </a>
    </main>
  )
}
