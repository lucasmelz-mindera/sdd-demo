import { useRef, useState } from 'react'

type CopyState = 'idle' | 'copied' | 'failed'

export function Lobby({ shareLink }: { shareLink: string }) {
  const input = useRef<HTMLInputElement>(null)
  const [copy, setCopy] = useState<CopyState>('idle')

  // The async Clipboard API can be denied (permissions, non-secure origins), so fall back
  // to copying the selected input.
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopy('copied')
    } catch {
      input.current?.select()
      setCopy(document.execCommand('copy') ? 'copied' : 'failed')
    }
  }

  return (
    <main className="screen">
      <h1>Room ready</h1>
      <p>Send this link to a friend:</p>
      <div className="share">
        <input ref={input} readOnly value={shareLink} onFocus={(e) => e.target.select()} aria-label="Share link" />
        <button onClick={copyLink}>{copy === 'copied' ? 'Copied!' : 'Copy'}</button>
      </div>
      {copy === 'failed' && <p className="waiting">Couldn't copy. The link is selected, so copy it yourself.</p>}
      <p className="waiting">Waiting for opponent…</p>
    </main>
  )
}
