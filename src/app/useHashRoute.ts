import { useSyncExternalStore } from 'react'
import { parseRoute, type Route } from '../room/roomId'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function getHash() {
  return location.hash
}

export function navigate(hash: string) {
  location.hash = hash
}

export function useHashRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash)
  return parseRoute(hash)
}
