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