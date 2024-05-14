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
      "page": "SlotMachine",
      "description": "Plongez dans l\'excitation de notre machine à sous en ligne où vous alignerez trois symboles pour gagner des Viardots. Avec des graphismes captivants et des récompenses éblouissantes, chaque tour est une aventure en soi. Tournez les rouleaux et laissez-vous emporter par le frisson de la victoire !"
    },
    {
      "id": 2,
      "name": "Mines",
      "picturePath": "./images/mines.png",
      "page": "MineGame",
      "description": "Plongez dans le Casino des Mines, où chaque tuile cache un secret : les étoiles mènent à la richesse, tandis que les bombes annoncent la catastrophe. Naviguez intelligemment à travers la grille pour révéler les étoiles, multipliant vos gains à chaque choix sûr. Mais attention ! Un seul faux pas pourrait faire exploser vos chances, mettant fin à la manche et réinitialisant vos gains. Testez votre chance et votre stratégie dans ce jeu palpitant de risque et de récompense !"
    },
    {
      "id": 3,
      "name": "Roulette",
      "picturePath": "./images/roulette.png",
      "page": "RouletteGame",
      "description": "Découvrez l'excitation de la roulette dans le confort de votre maison avec CasiDio ! Plongez dans l'ambiance électrisante d'un casino en ligne et misez sur vos numéros chanceux. Avec des graphismes saisissants et des fonctionnalités conviviales, notre jeu de roulette offre une expérience immersive inégalée. Testez votre chance dès aujourd'hui et voyez si la roue tourne en votre faveur sur CasiDio !",
    },
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
    expect(response.body.data.find((game) => game.id === 4)).toStrictEqual({
      "id": 4,
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

  // Edit fourth game
  response = await request(app)
    .put('/api/game/4')
    .set('x-access-token', userToken)
    .send({ name: 'PokerEdit', picturePath: './images/slot-machine.pngEdited', page: 'PokerEdit', description: 'Bon jeu edit'})
  expect(response.statusCode).toBe(200)

  // Verify update
  response = await request(app)
    .get('/games')
  expect(response.statusCode).toBe(200)
  expect(response.body.data.find((game) => game.id === 4)).toStrictEqual({
    "id": 4,
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

  // Edit fourth game
  response = await request(app)
    .put('/api/game/4')
    .set('x-access-token', userToken)
    .send({ name: 'PokerEditEdit' })
  expect(response.statusCode).toBe(200)

  // Verify update
  response = await request(app)
    .get('/games')
  expect(response.statusCode).toBe(200)
  expect(response.body.data.find((game) => game.id === 4)).toStrictEqual({
    "id": 4,
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

  // Remove fourth game
  response = await request(app)
    .delete('/api/game/4')
    .set('x-access-token', userToken)
  expect(response.statusCode).toBe(200)

  // Check that the old game doesn't exist anymore
  response = await request(app)
    .get('/games')
  expect(response.statusCode).toBe(200)
  expect(response.body.data.map((game) => game.id)).not.toContain(4)
})

test('Game delete : no game found', async () => {
  // Conection on admin
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'Ab*123-!' })
  expect(response.statusCode).toBe(200)
  const userToken = response.body.token

  response = await request(app)
    .delete('/api/game/10')
    .set('x-access-token', userToken)
  expect(response.statusCode).toBe(404)
})