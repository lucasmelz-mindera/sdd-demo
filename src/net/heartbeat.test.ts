import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHeartbeat } from './heartbeat'

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

function setup() {
  const send = vi.fn()
  const onTimeout = vi.fn()
  const heartbeat = createHeartbeat({ send, onTimeout })
  return { send, onTimeout, heartbeat }
}

describe('createHeartbeat', () => {
  it('sends a ping every 2 s', () => {
    const { send, heartbeat } = setup()
    vi.advanceTimersByTime(1999)
    expect(send).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(send).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(6000)
    expect(send).toHaveBeenCalledTimes(4)
    heartbeat.stop()
  })

  it('fires onTimeout exactly once after 10 s of silence', () => {
    const { onTimeout } = setup()
    vi.advanceTimersByTime(9999)
    expect(onTimeout).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onTimeout).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(60_000)
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it('stops pinging once it has timed out', () => {
    const { send } = setup()
    vi.advanceTimersByTime(10_000)
    const pings = send.mock.calls.length
    vi.advanceTimersByTime(10_000)
    expect(send).toHaveBeenCalledTimes(pings)
  })

  it('seen() postpones the timeout', () => {
    const { onTimeout, heartbeat } = setup()
    vi.advanceTimersByTime(8000)
    heartbeat.seen()
    vi.advanceTimersByTime(8000)
    expect(onTimeout).not.toHaveBeenCalled()
    heartbeat.seen()
    vi.advanceTimersByTime(9999)
    expect(onTimeout).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2000) // next check after 10 s of silence
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })

  it('stop() stops pings and the timeout', () => {
    const { send, onTimeout, heartbeat } = setup()
    vi.advanceTimersByTime(4000)
    heartbeat.stop()
    vi.advanceTimersByTime(60_000)
    expect(send).toHaveBeenCalledTimes(2)
    expect(onTimeout).not.toHaveBeenCalled()
  })

  it('uses injected timers and custom intervals', () => {
    let tick = () => {}
    let now = 0
    const send = vi.fn()
    const onTimeout = vi.fn()
    createHeartbeat({
      send,
      onTimeout,
      intervalMs: 100,
      timeoutMs: 300,
      timers: {
        setInterval: (fn: () => void) => ((tick = fn), 1),
        clearInterval: () => {},
        now: () => now,
      },
    })
    for (now = 100; now <= 300; now += 100) tick()
    expect(send).toHaveBeenCalledTimes(2)
    expect(onTimeout).toHaveBeenCalledTimes(1)
  })
})
