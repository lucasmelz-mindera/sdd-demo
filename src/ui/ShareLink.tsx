import { useState } from 'react'
import styles from './ShareLink.module.css'

export function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
  }

  return (
    <div className={styles.share}>
      <input className={styles.url} value={url} readOnly aria-label="Share link" onFocus={(e) => e.target.select()} />
      <button className={styles.copy} onClick={copy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
