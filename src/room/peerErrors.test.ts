import { describe, expect, it } from 'vitest'
import { isConnectionError } from './peerErrors'

describe('isConnectionError', () => {
  it.each(['network', 'server-error', 'socket-error', 'socket-closed', 'browser-incompatible', 'webrtc', 'negotiation-failed'])(
    '%j is a connection error',
    (type) => {
      expect(isConnectionError(type)).toBe(true)
    },
  )

  it.each(['peer-unavailable', 'unavailable-id', 'disconnected', 'invalid-id', 'connection-closed'])('%j is not', (type) => {
    expect(isConnectionError(type)).toBe(false)
  })
})
