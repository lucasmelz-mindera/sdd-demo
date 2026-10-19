// Peer and connection error types that end the session on the Connection error screen.
// Others are either handled on their own (`peer-unavailable`, `unavailable-id`) or recoverable.
const CONNECTION_ERRORS = [
  'network',
  'server-error',
  'socket-error',
  'socket-closed',
  'browser-incompatible',
  'webrtc',
  'negotiation-failed',
]

export function isConnectionError(type: string): boolean {
  return CONNECTION_ERRORS.includes(type)
}
