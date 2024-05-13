const app = require('../app')
const request = require('supertest')
const historyModel = require('../models/histories')

// --------------------------------------- //
//            HISTORY GET                  //
// --------------------------------------- //
test('History get : simple valid with null sold week', async () => {
  // Login on a user and save his token
  let response = await request(app)
    .post('/login')
    .send({ email: 'jordan@josserand.com', password: 'Ab*123-!' })
  expect(response.statusCode).toBe(200)
  const userToken = response.body.token

  // Get history of the user
  response = await request(app)
    .get('/api/history')
    .set('x-access-token', userToken)
  expect(response.statusCode).toBe(200)

  // check data
  expect(response.body.data).toStrictEqual({
    "evolutionSolde": [
      {
        "date": "04-2023",
        "total_amount": 2
      },
      {
        "date": "05-2023",
        "total_amount": 15
      }
    ],
    "evolutionSoldeWeek": {
      "total_amount": null
    }
  })
})

test('History get : some histories were added', async () => {
  // Login on a user and save his token
  let response = await request(app)
    .post('/login')
    .send({ email: 'jordan@josserand.com', password: 'Ab*123-!' })
  expect(response.statusCode).toBe(200)
  const userToken = response.body.token

  // Add some history
  let history = await historyModel.create({profit: 10, gameDate: new Date('2023-06-23T10:27:55.000Z')})
  history.setUser(3)
  history.setGame(1)
  history = await historyModel.create({profit: -11, gameDate: new Date('2023-06-23T10:27:55.000Z')})
  history.setUser(3)
  history.setGame(1)
  const currentDate = new Date(Date.now())
  history = await historyModel.create({profit: -100, gameDate: currentDate})
  history.setUser(3)
  history.setGame(1)

  // Get history of the user
  response = await request(app)
    .get('/api/history')
    .set('x-access-token', userToken)
  expect(response.statusCode).toBe(200)

  // check data
  expect(response.body.data).toStrictEqual({
    "evolutionSolde": [
      {
        "date": "04-2023",
        "total_amount": 2
      },
      {
        "date": "05-2023",
        "total_amount": 15
      },
      {
        "date": "06-2023",
        "total_amount": -1
      },
      {
        "date": `${(currentDate.getMonth() + 1) < 10 ? '0' : ''}${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`,
        "total_amount": -100
      }
    ],
    "evolutionSoldeWeek": {
      "total_amount": -100
    }
  })
})