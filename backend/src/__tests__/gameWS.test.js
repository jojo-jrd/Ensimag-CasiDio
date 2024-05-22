const gameWS = require('../controllers/gameWS')
const userModel = require('../models/users')

// Increase jest tiemout (needed for these tests)
jest.setTimeout(120000)

// Since JEST is adapted for REST tests, to tests web socket we will mock the web socket and only call the controller functions with the mocked ws
let lastMSG = {}
const WebSocketMock = {
    send: (msg) => {lastMSG = JSON.parse(msg)},
}

// --------------------------------------- //
//                QUESTIONS                //
// --------------------------------------- //
test('Questions : simple loose game', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Init phase
    await gameWS.initQuestion({Payload: {}}, WebSocketMock, user)

    // Props should exist and no errors
    expect(lastMSG).toHaveProperty('question')
    expect(lastMSG).toHaveProperty('difficulty')
    expect(lastMSG).toHaveProperty('category')
    expect(lastMSG).toHaveProperty('possibleAnswers')
    expect(lastMSG).toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('error')

    // Second phase with the first possible answer
    await gameWS.playQuestion({Payload: {answer: 'impossible answzer dzdzdz5z4dzd4z87d87zd846z878486876'}}, WebSocketMock, user)


    // Props should exist and no errors
    expect(lastMSG).toHaveProperty('state', 'loose')
    expect(lastMSG).toHaveProperty('gains', 0)
    expect(lastMSG).not.toHaveProperty('error')
})

test('Questions : simple win game', async () => {
    let win = false

    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Play and always answer the first possible answer
    // Could run forever BUT if it run 10 times it's already (3)^10 chance over (4)^10 which is 59049 chance over 1048576 which is 5% (there is always the timeout)
    while (!win) {
        // Init phase
        await gameWS.initQuestion({Payload: {}}, WebSocketMock, user)

        // Props should exist and no errors
        expect(lastMSG).toHaveProperty('question')
        expect(lastMSG).toHaveProperty('difficulty')
        expect(lastMSG).toHaveProperty('category')
        expect(lastMSG).toHaveProperty('possibleAnswers')
        expect(lastMSG).toHaveProperty('state')
        expect(lastMSG).not.toHaveProperty('error')

        // Second phase with the first possible answer
        await gameWS.playQuestion({Payload: {answer: lastMSG.possibleAnswers[0]}}, WebSocketMock, user)

        if (lastMSG.state === 'win')
            win = true
    }

    // Props should exist and no errors
    expect(lastMSG).toHaveProperty('state', 'win')
    expect(lastMSG).toHaveProperty('gains', 10)
    expect(lastMSG).not.toHaveProperty('error')
})

test('Questions : missing one field', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Init phase
    await gameWS.initQuestion({Payload: {}}, WebSocketMock, user)

    // Props should exist and no errors
    expect(lastMSG).toHaveProperty('question')
    expect(lastMSG).toHaveProperty('difficulty')
    expect(lastMSG).toHaveProperty('category')
    expect(lastMSG).toHaveProperty('possibleAnswers')
    expect(lastMSG).toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('error', 'you must specify the user answer')

    // Second phase with no answers
    await gameWS.playQuestion({Payload: {}}, WebSocketMock, user)

    // No props should exist, only errors
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('gains')
    expect(lastMSG).toHaveProperty('error')
})

test('Questions : even after the missing field should still be playable', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Second phase without the first one (still in playing state)
    await gameWS.playQuestion({Payload: {answer: 'la mer du nord'}}, WebSocketMock, user)

    // Props should exist and no errors
    expect(lastMSG).toHaveProperty('state')
    expect(lastMSG).toHaveProperty('gains')
    expect(lastMSG).not.toHaveProperty('error')
})

test('Questions : invalid state', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Second phase without the first one (not in playing state)
    await gameWS.playQuestion({Payload: {answer: 'la mer du nord'}}, WebSocketMock, user)

    // No props should exist, only errors
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('gains')
    expect(lastMSG).toHaveProperty('error', 'invalid game state')
})

test('Questions : invalid answer type', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})
    // Init phase
    await gameWS.initQuestion({Payload: {}}, WebSocketMock, user)

    // Props should exist and no errors
    expect(lastMSG).toHaveProperty('question')
    expect(lastMSG).toHaveProperty('difficulty')
    expect(lastMSG).toHaveProperty('category')
    expect(lastMSG).toHaveProperty('possibleAnswers')
    expect(lastMSG).toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('error', 'you must specify the user answer')

    // Second phase without answer invalid type
    await gameWS.playQuestion({Payload: {answer: 8}}, WebSocketMock, user)

    // No props should exist, only errors
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('gains')
    expect(lastMSG).toHaveProperty('error', 'answer field must be a string')
})

// --------------------------------------- //
//              SLOT MACHINE               //
// --------------------------------------- //
test('Slot machine : simple loose game', async () => {
    let loose = false

    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Play unitil we loose
    // Could run forever BUT if it run 10 times it's already (2)^10 chance over (9)^10 which is 1024 chance over 3486784401 which is very low (there is always the timeout)
    while (!loose) {
        // Run a game of slot machine
        await gameWS.playSlotMachine({Payload: {nbIcons: 9, indexesColumns: [0, 0, 0], betAmount: 10}}, WebSocketMock, user)

        if (lastMSG.state === 'loose')
            loose = true
    }

    // Props should exist
    expect(lastMSG).toHaveProperty('finalIndexes')
    expect(lastMSG).toHaveProperty('deltas')
    expect(lastMSG).toHaveProperty('gains', 0)
    expect(lastMSG).toHaveProperty('currentBalance')
    expect(lastMSG).toHaveProperty('state', 'loose')

    // Error should not exist
    expect(lastMSG).not.toHaveProperty('error')
})

test('Slot machine : simple win game', async () => {
    let win = false

    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Play unitil we win
    // Could run forever BUT if it run 10 times it's already (64)^10 chance over (81)^10 which is 9% (there is always the timeout)
    while (!win) {
        // Run a game of slot machine
        await gameWS.playSlotMachine({Payload: {nbIcons: 9, indexesColumns: [0, 0, 0], betAmount: 10}}, WebSocketMock, user)

        if (lastMSG.state === 'win')
            win = true
    }

    // Props should exist
    expect(lastMSG).toHaveProperty('finalIndexes')
    expect(lastMSG).toHaveProperty('deltas')
    expect(lastMSG).toHaveProperty('gains', 20)
    expect(lastMSG).toHaveProperty('currentBalance')
    expect(lastMSG).toHaveProperty('state', 'win')

    // Error should not exist
    expect(lastMSG).not.toHaveProperty('error')
})


test('Slot machine : missing one field', async () => {
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

// --------------------------------------- //
//               MINE GAMES                //
// --------------------------------------- //
test('Mine games : simple loose game', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Init phase
    await gameWS.initMineGame({Payload: {bombCount: 24, betAmount: 10}}, WebSocketMock, user)

    // Props should exist and no errors
    expect(lastMSG).toHaveProperty('grid')
    expect(lastMSG).toHaveProperty('multiplier', 1)
    expect(lastMSG).toHaveProperty('gainAmount', 10)
    expect(lastMSG).toHaveProperty('state', 'playing')
    expect(lastMSG).toHaveProperty('discoveredCells', 0)
    expect(lastMSG).not.toHaveProperty('error')

    // The balance should be updated
    expect(initialBalance).toBe(user.balance + 10)

    // Game phase :
    // If we are on a star cell, play one more time to loose
    await gameWS.playMineGame({Payload: {row: 0, col: 0}}, WebSocketMock, user)
    if (lastMSG.state !== 'loose') {
        await gameWS.playMineGame({Payload: {row: 1, col: 0}}, WebSocketMock, user)
    }

    // Props should exist and no errors
    expect(lastMSG).toHaveProperty('grid')
    expect(lastMSG).toHaveProperty('multiplier')
    expect(lastMSG).toHaveProperty('gainAmount')
    expect(lastMSG).toHaveProperty('state', 'loose')
    expect(lastMSG).toHaveProperty('discoveredCells')
    expect(lastMSG).not.toHaveProperty('error')
})

test('Mine games : simple win', async () => {
    let win = false

    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Play with only one mine until we can click one cell and cashout
    // Could run forever BUT if it run 10 times it's already 1 chance over (25)^10 which is 9.5367432e+13
    // So in fact it could not run forever.... (there is always the timeout)
    while (!win) {
        // Init phase
        await gameWS.initMineGame({Payload: {bombCount: 1, betAmount: 10}}, WebSocketMock, user)

        // Props should exist and no errors
        expect(lastMSG).toHaveProperty('grid')
        expect(lastMSG).toHaveProperty('multiplier', 1)
        expect(lastMSG).toHaveProperty('gainAmount', 10)
        expect(lastMSG).toHaveProperty('state', 'playing')
        expect(lastMSG).toHaveProperty('discoveredCells', 0)
        expect(lastMSG).not.toHaveProperty('error')

        // Game phase :
        await gameWS.playMineGame({Payload: {row: 0, col: 0}}, WebSocketMock, user)
        if (lastMSG.state === 'playing') {
            await gameWS.playMineGame({Payload: {cashOut: true}}, WebSocketMock, user)
            win = true
        }
    }

    // Props should exist and no errors
    expect(lastMSG).toHaveProperty('currentBalance')
    expect(lastMSG).toHaveProperty('gains')
    expect(lastMSG).not.toHaveProperty('error')
})
test('Mine games : init missing field', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Init phase
    await gameWS.initMineGame({Payload: {betAmount: 10}}, WebSocketMock, user)

    // Props should not exist, only errors
    expect(lastMSG).not.toHaveProperty('grid')
    expect(lastMSG).not.toHaveProperty('multiplier')
    expect(lastMSG).not.toHaveProperty('gainAmount')
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('discoveredCells')
    expect(lastMSG).toHaveProperty('error', 'bombCount nor betAmout not specified')

    // The balance should not be updated
    expect(initialBalance).toBe(user.balance)
})

test('Mine games : init wrong type', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Init phase
    await gameWS.initMineGame({Payload: {bombCount: '5', betAmount: 10}}, WebSocketMock, user)

    // Props should not exist, only errors
    expect(lastMSG).not.toHaveProperty('grid')
    expect(lastMSG).not.toHaveProperty('multiplier')
    expect(lastMSG).not.toHaveProperty('gainAmount')
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('discoveredCells')
    expect(lastMSG).toHaveProperty('error', 'bombCount should be an integer and in the range [1, 24]')

    // The balance should not be updated
    expect(initialBalance).toBe(user.balance)
})

test('Mine games : init wrong value (negative or 0)', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Init phase
    await gameWS.initMineGame({Payload: {bombCount: 0, betAmount: 10}}, WebSocketMock, user)

    // Props should not exist, only errors
    expect(lastMSG).not.toHaveProperty('grid')
    expect(lastMSG).not.toHaveProperty('multiplier')
    expect(lastMSG).not.toHaveProperty('gainAmount')
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('discoveredCells')
    expect(lastMSG).toHaveProperty('error', 'bombCount should be an integer and in the range [1, 24]')

    // The balance should not be updated
    expect(initialBalance).toBe(user.balance)
})

test('Mine games : init wrong value (to much)', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Init phase
    await gameWS.initMineGame({Payload: {bombCount: 25, betAmount: 10}}, WebSocketMock, user)

    // Props should not exist, only errors
    expect(lastMSG).not.toHaveProperty('grid')
    expect(lastMSG).not.toHaveProperty('multiplier')
    expect(lastMSG).not.toHaveProperty('gainAmount')
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('discoveredCells')
    expect(lastMSG).toHaveProperty('error', 'bombCount should be an integer and in the range [1, 24]')

    // The balance should not be updated
    expect(initialBalance).toBe(user.balance)
})

test('Mine games : invalid bet', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Get the initial balance of the user
    const initialBalance = user.balance

    // Init phase
    await gameWS.initMineGame({Payload: {bombCount: 5, betAmount: -3}}, WebSocketMock, user)

    // Props should not exist, only errors
    expect(lastMSG).not.toHaveProperty('grid')
    expect(lastMSG).not.toHaveProperty('multiplier')
    expect(lastMSG).not.toHaveProperty('gainAmount')
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('discoveredCells')
    expect(lastMSG).toHaveProperty('error', 'bet is not defined, below 0 or over the user balance')

    // The balance should not be updated
    expect(initialBalance).toBe(user.balance)
})

test('Mine games : invalid game state', async () => {
    // Play until I loose (see first Mine games test)
    const user = await userModel.findOne({where: {id: 3}})
    await gameWS.initMineGame({Payload: {bombCount: 24, betAmount: 10}}, WebSocketMock, user)
    await gameWS.playMineGame({Payload: {row: 0, col: 0}}, WebSocketMock, user)
    if (lastMSG.state !== 'loose') {
        await gameWS.playMineGame({Payload: {row: 1, col: 0}}, WebSocketMock, user)
    }

    // Replay without init
    await gameWS.playMineGame({Payload: {row: 0, col: 0}}, WebSocketMock, user)

    // Props should not exist, only errors
    expect(lastMSG).not.toHaveProperty('grid')
    expect(lastMSG).not.toHaveProperty('multiplier')
    expect(lastMSG).not.toHaveProperty('gainAmount')
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('discoveredCells')
    expect(lastMSG).toHaveProperty('error', 'invalid game state')
})

test('Mine games : missing row or col', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Init phase
    await gameWS.initMineGame({Payload: {bombCount: 5, betAmount: 10}}, WebSocketMock, user)

    // Play game without row
    await gameWS.playMineGame({Payload: {col: 0}}, WebSocketMock, user)

    // Props should not exist, only errors
    expect(lastMSG).not.toHaveProperty('grid')
    expect(lastMSG).not.toHaveProperty('multiplier')
    expect(lastMSG).not.toHaveProperty('gainAmount')
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('discoveredCells')
    expect(lastMSG).toHaveProperty('error', 'row nor col are not specified, haves invalids types or not in the range [0, 4]')
})

test('Mine games : invalid type row or col', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})
    // Init phase
    await gameWS.initMineGame({Payload: {bombCount: 5, betAmount: 10}}, WebSocketMock, user)

    // Play game without row
    await gameWS.playMineGame({Payload: {row: '0', col: 0}}, WebSocketMock, user)

    // Props should not exist, only errors
    expect(lastMSG).not.toHaveProperty('grid')
    expect(lastMSG).not.toHaveProperty('multiplier')
    expect(lastMSG).not.toHaveProperty('gainAmount')
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('discoveredCells')
    expect(lastMSG).toHaveProperty('error', 'row nor col are not specified, haves invalids types or not in the range [0, 4]')
})

test('Mine games : row or col below 0', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Init phase
    await gameWS.initMineGame({Payload: {bombCount: 5, betAmount: 10}}, WebSocketMock, user)

    // Play game without row
    await gameWS.playMineGame({Payload: {row: -1, col: 0}}, WebSocketMock, user)

    // Props should not exist, only errors
    expect(lastMSG).not.toHaveProperty('grid')
    expect(lastMSG).not.toHaveProperty('multiplier')
    expect(lastMSG).not.toHaveProperty('gainAmount')
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('discoveredCells')
    expect(lastMSG).toHaveProperty('error', 'row nor col are not specified, haves invalids types or not in the range [0, 4]')
})

test('Mine games : row or col to much', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // Init phase
    await gameWS.initMineGame({Payload: {bombCount: 5, betAmount: 10}}, WebSocketMock, user)

    // Play game without row
    await gameWS.playMineGame({Payload: {row: 5, col: 0}}, WebSocketMock, user)

    // Props should not exist, only errors
    expect(lastMSG).not.toHaveProperty('grid')
    expect(lastMSG).not.toHaveProperty('multiplier')
    expect(lastMSG).not.toHaveProperty('gainAmount')
    expect(lastMSG).not.toHaveProperty('state')
    expect(lastMSG).not.toHaveProperty('discoveredCells')
    expect(lastMSG).toHaveProperty('error', 'row nor col are not specified, haves invalids types or not in the range [0, 4]')
})

test('Roulette game : simple number win', async () => {
    let win = false

    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    while (!win) {
        // play roulette
        await gameWS.playRouletteGame(
            {Payload: {
                bets: [{
                    type: 'number',
                    value: '1',
                    amount: 10
                }]
            }},
            WebSocketMock,
            user
        )

        if (lastMSG.winnings>0)
            win = true
    }

    expect(lastMSG).toHaveProperty('randomNumber')
    expect(lastMSG).toHaveProperty('winnings')
    expect(lastMSG).not.toHaveProperty('error')
})

test('Roulette game : simple color win', async () => {
    let win = false

    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    while (!win) {
        // play roulette
        await gameWS.playRouletteGame(
            {Payload: {
                bets: [{
                    type: 'color',
                    value: 'red',
                    amount: 10
                }]
            }},
            WebSocketMock,
            user
        )

        if (lastMSG.winnings>0)
            win = true
    }

    expect(lastMSG).toHaveProperty('randomNumber')
    expect(lastMSG).toHaveProperty('winnings')
    expect(lastMSG).not.toHaveProperty('error')
})

test('Roulette game : simple parity win', async () => {
    let win = false

    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    while (!win) {
        // play roulette
        await gameWS.playRouletteGame(
            {Payload: {
                bets: [{
                    type: 'parity',
                    value: 'odd',
                    amount: 10
                }]
            }},
            WebSocketMock,
            user
        )

        if (lastMSG.winnings>0)
            win = true
    }

    expect(lastMSG).toHaveProperty('randomNumber')
    expect(lastMSG).toHaveProperty('winnings')
    expect(lastMSG).not.toHaveProperty('error')
})

test('Roulette game : simple group win', async () => {
    let win = false

    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    while (!win) {
        // play roulette
        await gameWS.playRouletteGame(
            {Payload: {
                bets: [{
                    type: 'group',
                    value: '1-18',
                    amount: 10
                }]
            }},
            WebSocketMock,
            user
        )

        if (lastMSG.winnings>0)
            win = true
    }

    expect(lastMSG).toHaveProperty('randomNumber')
    expect(lastMSG).toHaveProperty('winnings')
    expect(lastMSG).not.toHaveProperty('error')
})

test('Roulette game : simple column win', async () => {
    let win = false

    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    while (!win) {
        // play roulette
        await gameWS.playRouletteGame(
            {Payload: {
                bets: [{
                    type: 'column',
                    value: 'column1',
                    amount: 10
                }]
            }},
            WebSocketMock,
            user
        )

        if (lastMSG.winnings>0)
            win = true
    }

    expect(lastMSG).toHaveProperty('randomNumber')
    expect(lastMSG).toHaveProperty('winnings')
    expect(lastMSG).not.toHaveProperty('error')
})

test('Roulette game : simple dozen win', async () => {
    let win = false

    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    while (!win) {
        // play roulette
        await gameWS.playRouletteGame(
            {Payload: {
                bets: [{
                    type: 'dozen',
                    value: 'dozen1',
                    amount: 10
                }]
            }},
            WebSocketMock,
            user
        )

        if (lastMSG.winnings>0)
            win = true
    }

    expect(lastMSG).toHaveProperty('randomNumber')
    expect(lastMSG).toHaveProperty('winnings')
    expect(lastMSG).not.toHaveProperty('error')
})

test('Roulette game : simple loose', async () => {
    let loose = false

    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    while (!loose) {
        // play roulette
        await gameWS.playRouletteGame(
            {Payload: {
                bets: [{
                    type: 'number',
                    value: '1',
                    amount: 10
                }]
            }},
            WebSocketMock,
            user
        )

        if (lastMSG.winnings === 0)
            loose = true
    }

    expect(lastMSG).toHaveProperty('randomNumber')
    expect(lastMSG).toHaveProperty('winnings')
    expect(lastMSG).not.toHaveProperty('error')
})

test('Roulette game : invalid bets', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // play roulette
    await gameWS.playRouletteGame(
        {Payload: {
        }},
        WebSocketMock,
        user
    )

    expect(lastMSG).not.toHaveProperty('randomNumber')
    expect(lastMSG).not.toHaveProperty('winnings')
    expect(lastMSG).toHaveProperty('error', 'Invalid bets type')
})

test('Roulette game : invalid bet amount', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // play roulette
    await gameWS.playRouletteGame(
        {Payload: {
            bets: [{
                type: 'number',
                value: '1',
                amount: -1
            }]
        }},
        WebSocketMock,
        user
    )

    expect(lastMSG).not.toHaveProperty('randomNumber')
    expect(lastMSG).not.toHaveProperty('winnings')
    expect(lastMSG).toHaveProperty('error', 'Invalid bet amount')
})


test('Roulette game : invalid bet value', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // play roulette
    await gameWS.playRouletteGame(
        {Payload: {
            bets: [{
                type: 'number',
                value: [],
                amount: 10
            }]
        }},
        WebSocketMock,
        user
    )

    expect(lastMSG).not.toHaveProperty('randomNumber')
    expect(lastMSG).not.toHaveProperty('winnings')
    expect(lastMSG).toHaveProperty('error', 'Invalid bet value')
})


test('Roulette game : invalid bet type', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // play roulette
    await gameWS.playRouletteGame(
        {Payload: {
            bets: [{
                type: {},
                value: '1',
                amount: 10
            }]
        }},
        WebSocketMock,
        user
    )

    expect(lastMSG).not.toHaveProperty('randomNumber')
    expect(lastMSG).not.toHaveProperty('winnings')
    expect(lastMSG).toHaveProperty('error', 'Invalid bet type')
})

test('Roulette game : invalid group range', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // play roulette
    await gameWS.playRouletteGame(
        {Payload: {
            bets: [{
                type: 'group',
                value: '1-17',
                amount: 10
            }]
        }},
        WebSocketMock,
        user
    )

    expect(lastMSG).not.toHaveProperty('randomNumber')
    expect(lastMSG).not.toHaveProperty('winnings')
    expect(lastMSG).toHaveProperty('error', 'invalid group range')
})

test('Roulette game : invalid column range', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // play roulette
    await gameWS.playRouletteGame(
        {Payload: {
            bets: [{
                type: 'column',
                value: 'column0',
                amount: 10
            }]
        }},
        WebSocketMock,
        user
    )

    expect(lastMSG).not.toHaveProperty('randomNumber')
    expect(lastMSG).not.toHaveProperty('winnings')
    expect(lastMSG).toHaveProperty('error', 'invalid column range')
})

test('Roulette game : invalid dozen range', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // play roulette
    await gameWS.playRouletteGame(
        {Payload: {
            bets: [{
                type: 'dozen',
                value: 'dozen0',
                amount: 10
            }]
        }},
        WebSocketMock,
        user
    )

    expect(lastMSG).not.toHaveProperty('randomNumber')
    expect(lastMSG).not.toHaveProperty('winnings')
    expect(lastMSG).toHaveProperty('error', 'invalid dozen range')
})

test('Roulette game : invalid type range', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // play roulette
    await gameWS.playRouletteGame(
        {Payload: {
            bets: [{
                type: 'invalid type',
                value: 'dozen1',
                amount: 10
            }]
        }},
        WebSocketMock,
        user
    )

    expect(lastMSG).not.toHaveProperty('randomNumber')
    expect(lastMSG).not.toHaveProperty('winnings')
    expect(lastMSG).toHaveProperty('error', 'type not found')
})

test('Roulette game : bet to high', async () => {
    // Get the third user
    const user = await userModel.findOne({where: {id: 3}})

    // play roulette
    await gameWS.playRouletteGame(
        {Payload: {
            bets: [{
                type: 'dozen',
                value: 'dozen1',
                amount: 9999999999999999999999999999999999999999999999999999
            }]
        }},
        WebSocketMock,
        user
    )

    expect(lastMSG).not.toHaveProperty('randomNumber')
    expect(lastMSG).not.toHaveProperty('winnings')
    expect(lastMSG).toHaveProperty('error', 'bet is not a number, below 0 or over the user balance')
})