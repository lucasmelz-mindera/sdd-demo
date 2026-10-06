import { describe, expect, it } from 'vitest'
import { newGame } from '../game/ticTacToe'
import { playing, unlessEnded, type RoomView } from './roomView'

const game = newGame({ name: 'Host', emoji: '🐶' }, { name: 'Guest', emoji: '🐱' })

describe('unlessEnded', () => {
  it.each<[string, RoomView]>([
    ['starting', { status: 'starting' }],
    ['waiting', { status: 'waiting', shareUrl: 'https://x/#/room/k7m2qx' }],
    ['connecting', { status: 'connecting' }],
    ['playing', playing(game, 'guest')],
  ])('moves on from %s', (_, current) => {
    const next: RoomView = { status: 'ended', reason: 'full' }
    expect(unlessEnded(next)(current)).toBe(next)
  })

  it.each<[string, RoomView]>([
    ['a game state', playing(game, 'guest')],
    ['another ending', { status: 'ended', reason: 'network' }],
    ['waiting', { status: 'waiting', shareUrl: 'https://x/#/room/k7m2qx' }],
  ])('keeps an ended room ended when %s arrives', (_, next) => {
    const ended: RoomView = { status: 'ended', reason: 'not-found' }
    expect(unlessEnded(next)(ended)).toBe(ended)
  })
})
