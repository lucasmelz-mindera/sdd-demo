import { describe, expect, it } from 'vitest'
import { newGame } from '../game/ticTacToe'
import { parseMessage } from './protocol'

const state = newGame({ name: 'Host', emoji: '🐶' }, { name: 'Guest', emoji: '🐱' })

describe('parseMessage accepts', () => {
  it.each([
    ['guest hello', { type: 'hello', name: 'Ana', emoji: '🐱' }],
    ['host hello with game', { type: 'hello', name: 'Bo', emoji: '🐶', game: 'tic-tac-toe' }],
    ['move to cell 0', { type: 'move', cell: 0 }],
    ['move to cell 8', { type: 'move', cell: 8 }],
    ['state', { type: 'state', state }],
  ])('%s', (_, data) => {
    expect(parseMessage(data)).toEqual(data)
  })

  it('a state that went through JSON', () => {
    const data = JSON.parse(JSON.stringify({ type: 'state', state }))
    expect(parseMessage(data)).toEqual(data)
  })
})

describe('parseMessage rejects', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'hello'],
    ['a number', 4],
    ['an array', [{ type: 'move', cell: 1 }]],
    ['missing type', { cell: 1 }],
    ['unknown type', { type: 'dance' }],
    ['non-string type', { type: 7 }],
    ['hello without name', { type: 'hello', emoji: '🐱' }],
    ['hello with numeric name', { type: 'hello', name: 1, emoji: '🐱' }],
    ['hello without emoji', { type: 'hello', name: 'Ana' }],
    ['hello with numeric emoji', { type: 'hello', name: 'Ana', emoji: 1 }],
    ['hello with numeric game', { type: 'hello', name: 'Ana', emoji: '🐱', game: 1 }],
    ['hello with unknown game', { type: 'hello', name: 'Ana', emoji: '🐱', game: 'chess' }],
    ['move without cell', { type: 'move' }],
    ['move with string cell', { type: 'move', cell: '4' }],
    ['move with cell -1', { type: 'move', cell: -1 }],
    ['move with cell 9', { type: 'move', cell: 9 }],
    ['move with non-integer cell', { type: 'move', cell: 2.5 }],
    ['move with NaN cell', { type: 'move', cell: NaN }],
    ['state without state', { type: 'state' }],
    ['state with board of 8', { type: 'state', state: { ...state, board: state.board.slice(1) } }],
    ['state with bad cell value', { type: 'state', state: { ...state, board: ['Z', ...state.board.slice(1)] } }],
    ['state with bad turn', { type: 'state', state: { ...state, turn: 'Y' } }],
    ['state with bad result', { type: 'state', state: { ...state, result: { kind: 'won' } } }],
    ['state with missing players', { type: 'state', state: { ...state, players: { host: state.players.host } } }],
    [
      'state with mistyped player',
      { type: 'state', state: { ...state, players: { ...state.players, guest: { name: 'G', emoji: 1, mark: 'O' } } } },
    ],
    ['state with bad rematchVotes', { type: 'state', state: { ...state, rematchVotes: ['nobody'] } }],
  ])('%s', (_, data) => {
    expect(parseMessage(data)).toBeNull()
  })
})
