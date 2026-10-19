export function StatusScreen({ title, message }: { title: string; message?: string }) {
  return (
    <main className="screen">
      <h1>{title}</h1>
      {message && <p>{message}</p>}
      <a href="#/">Back home</a>
    </main>
  )
}
