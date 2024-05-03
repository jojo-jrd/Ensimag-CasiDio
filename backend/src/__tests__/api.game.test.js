const app = require('../app')
const request = require('supertest')

// --------------------------------------- //
//               GAME GET                  //
// --------------------------------------- //
test('Game get : simple valid', async () => {
  const response = await request(app)
    .get('/games')
  expect(response.statusCode).toBe(200)
  
  expect(response.body.data).toStrictEqual([
    {
      "id": 1,
      "name": "Machine à sous",
      "picturePath": "./images/slot-machine.png",
      "page": "slot-machine",
      "description": "Une machine à sous"
    },
    {
      "id": 2,
      "name": "Mines",
      "picturePath": "./../../assets/mines.png",
      "page": "mines",
      "description": "Un démineur"
    }
  ])
})

// --------------------------------------- //
//             GAME CREATION               //
// --------------------------------------- //
test('Game creation : simple creation', async () => {
    // Connection on admin
    let response = await request(app)
        .post('/login')
        .send({ email: 'a@a.com', password: 'Ab*123-!' })
    expect(response.statusCode).toBe(200)
    const userToken = response.body.token

    // Create a game
    response = await request(app)
        .post('/api/game')
        .set('x-access-token', userToken)
        .send({ name: 'Poker', picturePath: './images/slot-machine.png', page: 'Poker', description: 'Bon jeu'})
    expect(response.statusCode).toBe(200)

    // Check if the game is created
    response = await request(app)
      .get('/games')
    expect(response.statusCode).toBe(200)
    expect(response.body.data.find((game) => game.id === 3)).toStrictEqual({
      "id": 3,
      "name": "Poker",
      "picturePath": "./images/slot-machine.png",
      "page": "Poker",
      "description": "Bon jeu"
    })
})

test('Game creation : missing fields', async () => {
  // Connection on admin
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'Ab*123-!' })
  expect(response.statusCode).toBe(200)
  const userToken = response.body.token

  // Create a game
  response = await request(app)
    .post('/api/game')
    .set('x-access-token', userToken)
    .send({ name: 'Poker', page: 'Poker', description: 'Bon jeu'})
  expect(response.statusCode).toBe(400)
})

// --------------------------------------- //
//             GAME EDITION                //
// --------------------------------------- //
test('Game edition : simple edit', async () => {
  // Conection on admin
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'Ab*123-!' })
  expect(response.statusCode).toBe(200)
  const userToken = response.body.token

  // Edit third game
  response = await request(app)
    .put('/api/game/3')
    .set('x-access-token', userToken)
    .send({ name: 'PokerEdit', picturePath: './images/slot-machine.pngEdited', page: 'PokerEdit', description: 'Bon jeu edit'})
  expect(response.statusCode).toBe(200)

  // Verify update
  response = await request(app)
    .get('/games')
  expect(response.statusCode).toBe(200)
  expect(response.body.data.find((game) => game.id === 3)).toStrictEqual({
    "id": 3,
    "name": "PokerEdit",
    "picturePath": "./images/slot-machine.pngEdited",
    "page": "PokerEdit",
    "description": "Bon jeu edit"
  })
})

test('Game edition : edit one field', async () => {
  // Conection on admin
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'Ab*123-!' })
  expect(response.statusCode).toBe(200)
  const userToken = response.body.token

  // Edit third game
  response = await request(app)
    .put('/api/game/3')
    .set('x-access-token', userToken)
    .send({ name: 'PokerEditEdit' })
  expect(response.statusCode).toBe(200)

  // Verify update
  response = await request(app)
    .get('/games')
  expect(response.statusCode).toBe(200)
  expect(response.body.data.find((game) => game.id === 3)).toStrictEqual({
    "id": 3,
    "name": "PokerEditEdit",
    "picturePath": "./images/slot-machine.pngEdited",
    "page": "PokerEdit",
    "description": "Bon jeu edit"
  })
})

test('Game edition : no game found', async () => {
  // Conection on admin
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'Ab*123-!' })
  expect(response.statusCode).toBe(200)
  const userToken = response.body.token

  response = await request(app)
    .put('/api/game/10')
    .set('x-access-token', userToken)
    .send({ name: 'PokerEditEdit' })
  expect(response.statusCode).toBe(404)
})

// --------------------------------------- //
//              GAME DELETE                //
// --------------------------------------- //
test('Game delete : simple deletion', async () => {
  // Conection on admin
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'Ab*123-!' })
  expect(response.statusCode).toBe(200)
  const userToken = response.body.token

  // Remove third game
  response = await request(app)
    .delete('/api/game/3')
    .set('x-access-token', userToken)
  expect(response.statusCode).toBe(200)

  // Check that the old game doesn't exist anymore
  response = await request(app)
    .get('/games')
  expect(response.statusCode).toBe(200)
  expect(response.body.data.map((game) => game.id)).not.toContain(3)
})

test('Game delete : no game found', async () => {
  // Conection on admin
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'Ab*123-!' })
  expect(response.statusCode).toBe(200)
  const userToken = response.body.token

  // Remove third game
  response = await request(app)
    .delete('/api/game/10')
    .set('x-access-token', userToken)
  expect(response.statusCode).toBe(404)
})