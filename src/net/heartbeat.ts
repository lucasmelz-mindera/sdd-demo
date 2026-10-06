// Liveness over the data channel: ping every intervalMs, and give up on the
// opponent once nothing was seen for timeoutMs. Pure; the clock is injected.
type Timers = {
  setInterval(fn: () => void, ms: number): unknown
  clearInterval(id: unknown): void
  now(): number
}

const globalTimers: Timers = {
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (id) => clearInterval(id as ReturnType<typeof setInterval>),
  now: () => Date.now(),
}

export type Heartbeat = { seen(): void; stop(): void }

export function createHeartbeat(opts: {
  send: () => void // sends { type: 'ping' }
  onTimeout: () => void
  intervalMs?: number
  timeoutMs?: number
  timers?: Timers
}): Heartbeat {
  const { send, onTimeout, intervalMs = 2000, timeoutMs = 10_000, timers = globalTimers } = opts
  let lastSeen = timers.now()
  let stopped = false

  const id = timers.setInterval(() => {
    if (timers.now() - lastSeen >= timeoutMs) {
      stop()
      onTimeout()
    } else {
      send()
    }
  }, intervalMs)

  function stop() {
    if (stopped) return
    stopped = true
    timers.clearInterval(id)
  }

  return {
    seen() {
      lastSeen = timers.now()
    },
    stop,
  }
}
