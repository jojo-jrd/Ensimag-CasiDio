const app = require('../app')
const request = require('supertest')
const gameWS = require('../controllers/gameWS')
const userModel = require('../models/users')
const expectCt = require('helmet/dist/middlewares/expect-ct')

let lastMSG = {}
const WebSocketMock = {
    send: (msg) => {lastMSG = JSON.parse(msg)},
}
// --------------------------------------- //
//              SLOT MACHINE               //
// --------------------------------------- //
test('Slot machine : simple game', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Run a game of slot machine
    await gameWS.playSlotMachine({Payload: {nbIcons: 9, indexesColumns: [0, 0, 0], betAmount: 10}}, WebSocketMock, user)

    // Props should exist
    expect(lastMSG).toHaveProperty('finalIndexes')
    expect(lastMSG).toHaveProperty('deltas')
    expect(lastMSG).toHaveProperty('gains')
    expect(lastMSG).toHaveProperty('currentBalance')
    expect(lastMSG).toHaveProperty('state')

    // Error should not exist
    expect(lastMSG).not.toHaveProperty('error')

    // Initial and curent balances shoulds not be the same (no way, less or higher)
    expect(initialBalance).not.toBe(user.balance)
})

test('Slot machine : missing one fields', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Run a game of slot machine without nbIcons
    await gameWS.playSlotMachine({Payload: {indexesColumns: [0, 0, 0], betAmount: 10}}, WebSocketMock, user)

    // Props should not exist
    expect(lastMSG).not.toHaveProperty('finalIndexes')
    expect(lastMSG).not.toHaveProperty('deltas')
    expect(lastMSG).not.toHaveProperty('gains')
    expect(lastMSG).not.toHaveProperty('currentBalance')
    expect(lastMSG).not.toHaveProperty('state')

    // Error should exist and known
    expect(lastMSG).toHaveProperty('error', 'nbIcons, indexesColumns nor betAmout not specified')

    // Initial and curent balances shoulds be the same
    expect(initialBalance).toBe(user.balance)
})

test('Slot machine : invalid nbIncon type', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Run a game of slot machine with wrong nbIcons type
    await gameWS.playSlotMachine({Payload: {nbIcons: '1',indexesColumns: [0, 0, 0], betAmount: 10}}, WebSocketMock, user)

    // Props should not exist
    expect(lastMSG).not.toHaveProperty('finalIndexes')
    expect(lastMSG).not.toHaveProperty('deltas')
    expect(lastMSG).not.toHaveProperty('gains')
    expect(lastMSG).not.toHaveProperty('currentBalance')
    expect(lastMSG).not.toHaveProperty('state')

    // Error should exist and known
    expect(lastMSG).toHaveProperty('error', 'nbIcons should be a number')

    // Initial and curent balances shoulds be the same
    expect(initialBalance).toBe(user.balance)
})

test('Slot machine : invalid indexColumns type', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Run a game of slot machine with wrong indexesColumns type
    await gameWS.playSlotMachine({Payload: {nbIcons: 9, indexesColumns: '3', betAmount: 10}}, WebSocketMock, user)

    // Props should not exist
    expect(lastMSG).not.toHaveProperty('finalIndexes')
    expect(lastMSG).not.toHaveProperty('deltas')
    expect(lastMSG).not.toHaveProperty('gains')
    expect(lastMSG).not.toHaveProperty('currentBalance')
    expect(lastMSG).not.toHaveProperty('state')

    // Error should exist and known
    expect(lastMSG).toHaveProperty('error', 'indexesColumns should be an array of size 3')

    // Initial and curent balances shoulds be the same
    expect(initialBalance).toBe(user.balance)
})

test('Slot machine : invalid indexColumns size', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Run a game of slot machine with wrong indexesColumns length
    await gameWS.playSlotMachine({Payload: {nbIcons: 9, indexesColumns: [0, 0], betAmount: 10}}, WebSocketMock, user)

    // Props should not exist
    expect(lastMSG).not.toHaveProperty('finalIndexes')
    expect(lastMSG).not.toHaveProperty('deltas')
    expect(lastMSG).not.toHaveProperty('gains')
    expect(lastMSG).not.toHaveProperty('currentBalance')
    expect(lastMSG).not.toHaveProperty('state')

    // Error should exist and known
    expect(lastMSG).toHaveProperty('error', 'indexesColumns should be an array of size 3')

    // Initial and curent balances shoulds be the same
    expect(initialBalance).toBe(user.balance)
})

test('Slot machine : invalid betAmount type', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Run a game of slot machine with wrong betAmount type
    await gameWS.playSlotMachine({Payload: {nbIcons: 9, indexesColumns: [0, 0, 0], betAmount: '10'}}, WebSocketMock, user)

    // Props should not exist
    expect(lastMSG).not.toHaveProperty('finalIndexes')
    expect(lastMSG).not.toHaveProperty('deltas')
    expect(lastMSG).not.toHaveProperty('gains')
    expect(lastMSG).not.toHaveProperty('currentBalance')
    expect(lastMSG).not.toHaveProperty('state')

    // Error should exist and known
    expect(lastMSG).toHaveProperty('error', 'bet is not a number, below 0 or over the user balance')

    // Initial and curent balances shoulds be the same
    expect(initialBalance).toBe(user.balance)
})

test('Slot machine : betAmount below 0', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Run a game of slot machine with wrong betAmount
    await gameWS.playSlotMachine({Payload: {nbIcons: 9, indexesColumns: [0, 0, 0], betAmount: -1}}, WebSocketMock, user)

    // Props should not exist
    expect(lastMSG).not.toHaveProperty('finalIndexes')
    expect(lastMSG).not.toHaveProperty('deltas')
    expect(lastMSG).not.toHaveProperty('gains')
    expect(lastMSG).not.toHaveProperty('currentBalance')
    expect(lastMSG).not.toHaveProperty('state')

    // Error should exist and known
    expect(lastMSG).toHaveProperty('error', 'bet is not a number, below 0 or over the user balance')

    // Initial and curent balances shoulds be the same
    expect(initialBalance).toBe(user.balance)
})

test('Slot machine : betAmount over the user balance', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Run a game of slot machine with wrong betAmount
    await gameWS.playSlotMachine({Payload: {nbIcons: 9, indexesColumns: [0, 0, 0], betAmount: 999999999}}, WebSocketMock, user)

    // Props should not exist
    expect(lastMSG).not.toHaveProperty('finalIndexes')
    expect(lastMSG).not.toHaveProperty('deltas')
    expect(lastMSG).not.toHaveProperty('gains')
    expect(lastMSG).not.toHaveProperty('currentBalance')
    expect(lastMSG).not.toHaveProperty('state')

    // Error should exist and known
    expect(lastMSG).toHaveProperty('error', 'bet is not a number, below 0 or over the user balance')

    // Initial and curent balances shoulds be the same
    expect(initialBalance).toBe(user.balance)
})