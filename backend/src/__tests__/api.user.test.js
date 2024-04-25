const app = require('../app')
const request = require('supertest')

// --------------------------------------- //
//            ACOUNT CREATION              //
// --------------------------------------- //
test('Acount creation : simple valid', async () => {
  const response = await request(app)
    .post('/register')
    .send({ firstName: 'Test', lastName: 'TEST', email: 'test@test.com', password: '1m02P@SsF0rt!', address: '8 rue de gaulle', birthDate: new Date('2002-09-17') })
  expect(response.statusCode).toBe(200)
})

test('Acount creation : missing mandatory fields', async () => {
  const response = await request(app)
    .post('/register')
    .send({ firstName: 'Test', email: 'test@test.com', password: '1m02P@SsF0rt!', address: '8 rue de gaulle', birthDate: new Date('2002-09-17') })

  expect(response.statusCode).toBe(400)
})

test('Acount creation : weak password', async () => {
  const response = await request(app)
    .post('/register')
    .send({ firstName: 'Test', lastName: 'TEST', email: 'test@test.com', password: 'weekpassword', address: '8 rue de gaulle', birthDate: new Date('2002-09-17') })
  
  expect(response.statusCode).toBe(400)
})

test('Acount creation : bad email', async () => {
  const response = await request(app)
    .post('/register')
    .send({ firstName: 'Test', lastName: 'TEST', email: 'notanemail', password: '1m02P@SsF0rt!', address: '8 rue de gaulle', birthDate: new Date('2002-09-17') })
  
  expect(response.statusCode).toBe(400)
})

// --------------------------------------- //
//            ACOUNT CONNECTION            //
// --------------------------------------- //
test('Acount connection : simple connection', async () => {
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'ab*123456' })

  expect(response.statusCode).toBe(200)
  expect(response.body).toHaveProperty('token')
})

test('Acount connection : missing mandatory fields', async () => {
  let response = await request(app)
    .post('/login')
    .send({ password: 'ab*123456' })

  expect(response.statusCode).toBe(400)
})

test('Acount connection : wrong email', async () => {
  let response = await request(app)
    .post('/login')
    .send({ email: 'email@unknown.com', password: 'ab*123456' })

  expect(response.statusCode).toBe(403)
})

test('Acount connection : wrong password', async () => {
  let response = await request(app)
    .post('/login')
    .send({ email: 'a@a.com', password: 'ab*123456invalid' })

  expect(response.statusCode).toBe(403)
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
