const app = require('../app')
const request = require('supertest')

// --------------------------------------- //
//             USER CREATION               //
// --------------------------------------- //
test('User creation : simple valid', async () => {
  const response = await request(app)
    .post('/register')
    .send({ firstName: 'Test', lastName: 'TEST', email: 'test@test.com', password: '1m02P@SsF0rt!', address: '8 rue de gaulle', birthDate: new Date('2002-09-17') })
  expect(response.statusCode).toBe(200)
})

test('User creation : missing mandatory fields', async () => {
  const response = await request(app)
    .post('/register')
    .send({ firstName: 'Test', email: 'test@test.com', password: '1m02P@SsF0rt!', address: '8 rue de gaulle', birthDate: new Date('2002-09-17') })

  expect(response.statusCode).toBe(400)
})

test('User creation : weak password', async () => {
  const response = await request(app)
    .post('/register')
    .send({ firstName: 'Test', lastName: 'TEST', email: 'test@test.com', password: 'weekpassword', address: '8 rue de gaulle', birthDate: new Date('2002-09-17') })
  
  expect(response.statusCode).toBe(400)
})

test('User creation : bad email', async () => {
  const response = await request(app)
    .post('/register')
    .send({ firstName: 'Test', lastName: 'TEST', email: 'notanemail', password: '1m02P@SsF0rt!', address: '8 rue de gaulle', birthDate: new Date('2002-09-17') })
  
  expect(response.statusCode).toBe(400)
})

// --------------------------------------- //
//            User CONNECTION            //
// --------------------------------------- //
test('User connection : simple connection', async () => {
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'ab*123456' })

  expect(response.statusCode).toBe(200)
  expect(response.body).toHaveProperty('token')
})

test('User connection : missing mandatory fields', async () => {
  let response = await request(app)
    .post('/login')
    .send({ password: 'ab*123456' })

  expect(response.statusCode).toBe(400)
})

test('User connection : wrong email', async () => {
  let response = await request(app)
    .post('/login')
    .send({ email: 'email@unknown.com', password: 'ab*123456' })

  expect(response.statusCode).toBe(403)
})

test('User connection : wrong password', async () => {
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'ab*123456invalid' })

  expect(response.statusCode).toBe(403)
})

// --------------------------------------- //
//             USER INFORMATIONS           //
// --------------------------------------- //

test('User informations : simple get', async () => {
  // Connect to simple user
  let response = await request(app)
    .post('/login')
    .send({ email: 'jordan@josserand.com', password: 'ab*123456' })
  expect(response.statusCode).toBe(200)

  // Get informations
  response = await request(app)
    .get('/api/user')
    .set('x-access-token', response.body.token)
    
  expect(response.statusCode).toBe(200)
  expect(response.body).toHaveProperty('data')
  expect(response.body.data).toStrictEqual({
    "firstName": "Jordan",
    "lastName": "Josserand",
    "email": "jordan@josserand.com",
    "address": "12 rue hassoul",
    "birthDate": "2024-04-25T10:27:55.000Z",
    "balance": 999999,
    "isAdmin": false
  })
})

test('User informations : no token', async () => {
  const response = await request(app)
    .get('/api/user')

  expect(response.status).toBe(403)
})

test('User informations : invalid token', async () => {
  const response = await request(app)
    .get('/api/user')
    .set('x-access-token', 'eyJhbGciOiJIUzI1NiJ9.YUBhLmNvbQ.RAwxFEsI4ZF64_8fr43V_4tJ7nMaYgjsblEVGXHQp3C')

  expect(response.status).toBe(403)
})

// test('Test if user can log in and list users', async () => {
//   let response = await request(app)
//     .post('/login')
//     .send({ email: 'Sebastien.Viardot@grenoble-inp.fr', password: '123456' })
//   expect(response.statusCode).toBe(200)
//   expect(response.body).toHaveProperty('token')
//   response = await request(app)
//     .get('/api/users')
//     .set('x-access-token', response.body.token)
//   expect(response.statusCode).toBe(200)
//   expect(response.body.message).toBe('Returning users')
//   expect(response.body.data.length).toBeGreaterThan(0)
// })
