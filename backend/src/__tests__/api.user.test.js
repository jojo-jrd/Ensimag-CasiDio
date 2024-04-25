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
    .send({ email: 'a@a.com', password: 'Ab*123-!' })

  expect(response.statusCode).toBe(200)
  expect(response.body).toHaveProperty('token')
})

test('User connection : missing mandatory fields', async () => {
  let response = await request(app)
    .post('/login')
    .send({ password: 'Ab*123-!' })

  expect(response.statusCode).toBe(400)
})

test('User connection : wrong email', async () => {
  let response = await request(app)
    .post('/login')
    .send({ email: 'email@unknown.com', password: 'Ab*123-!' })

  expect(response.statusCode).toBe(403)
})

test('User connection : wrong password', async () => {
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'Ab*123-!invalid' })

  expect(response.statusCode).toBe(403)
})

// --------------------------------------- //
//             USER INFORMATIONS           //
// --------------------------------------- //

test('User informations : simple get', async () => {
  // Connect to simple user
  let response = await request(app)
    .post('/login')
    .send({ email: 'jordan@josserand.com', password: 'Ab*123-!' })
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

// --------------------------------------- //
//                USER UPDATE              //
// --------------------------------------- //

test('User update : update all fields', async () => {
  // Connection to the user
  let response = await request(app)
    .post('/login')
    .send({ email: 'Lukas.Loiodice@grenoble-inp.fr', password: 'Ab*123-!' })
  expect(response.statusCode).toBe(200)

  // Update the user
  response = await request(app)
    .put('/api/user')
    .set('x-access-token', response.body.token)
    .send({ email: 'edit.edit@grenoble-inp.fr', password: '1m02P@SsF0rt!', firstName: 'edit', lastName: 'edit', address: 'edit', birthDate: '2002-04-25T10:27:55.000Z' })

  expect(response.statusCode).toBe(200)

  // Check if the user has been updated
  response = await request(app)
    .post('/login')
    .send({ email: 'edit.edit@grenoble-inp.fr', password: '1m02P@SsF0rt!' })
  expect(response.statusCode).toBe(200)
  response = await request(app)
    .get('/api/user')
    .set('x-access-token', response.body.token)
  expect(response.statusCode).toBe(200)
  expect(response.body.data).toStrictEqual({
    "firstName": "edit",
    "lastName": "edit",
    "email": "edit.edit@grenoble-inp.fr",
    "address": "edit",
    "birthDate": "2002-04-25T10:27:55.000Z",
    "balance": 999999,
    "isAdmin": true
  })
})

test('User update : update one field', async () => {
  // Connection to the user
  let response = await request(app)
    .post('/login')
    .send({ email: 'edit.edit@grenoble-inp.fr', password: '1m02P@SsF0rt!' })
  expect(response.statusCode).toBe(200)

  // Update the user
  response = await request(app)
    .put('/api/user')
    .set('x-access-token', response.body.token)
    .send({ firstName: 'newEdit' })

  expect(response.statusCode).toBe(200)

  // Check if the user has been updated
  response = await request(app)
    .post('/login')
    .send({ email: 'edit.edit@grenoble-inp.fr', password: '1m02P@SsF0rt!' })
  expect(response.statusCode).toBe(200)
  response = await request(app)
    .get('/api/user')
    .set('x-access-token', response.body.token)
  expect(response.statusCode).toBe(200)
  expect(response.body.data).toStrictEqual({
    "firstName": "newEdit",
    "lastName": "edit",
    "email": "edit.edit@grenoble-inp.fr",
    "address": "edit",
    "birthDate": "2002-04-25T10:27:55.000Z",
    "balance": 999999,
    "isAdmin": true
  })
})

test('User update : update bad password', async () => {
  // Connection to the user
  let response = await request(app)
    .post('/login')
    .send({ email: 'edit.edit@grenoble-inp.fr', password: '1m02P@SsF0rt!' })
  expect(response.statusCode).toBe(200)

  // Update the user
  response = await request(app)
    .put('/api/user')
    .set('x-access-token', response.body.token)
    .send({ password: 'weekpassword' })

  expect(response.statusCode).toBe(400)
})

// --------------------------------------- //
//                USER DELETE              //
// --------------------------------------- //

test('User delete : simple user delete', async () => {
  // Connection to the user
  let response = await request(app)
    .post('/login')
    .send({ email: 'edit.edit@grenoble-inp.fr', password: '1m02P@SsF0rt!' })
  expect(response.statusCode).toBe(200)

  // Update the user
  response = await request(app)
    .delete('/api/user')
    .set('x-access-token', response.body.token)

  expect(response.statusCode).toBe(200)

  // Check that we can't connect to the user anymore
  response = await request(app)
    .post('/login')
    .send({ email: 'edit.edit@grenoble-inp.fr', password: '1m02P@SsF0rt!' })
  expect(response.statusCode).toBe(403)
})