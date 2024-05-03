const userModel = require('../models/users.js')
const gameModel = require('../models/games.js')
const historyModel = require('../models/histories.js')
const bcrypt = require('bcrypt');
// Ajouter ici les nouveaux require des nouveaux modèles

// eslint-disable-next-line no-unexpected-multiline
(async () => {
  // Regénère la base de données
  await require('../models/database.js').sync({ force: true })
  console.log('Base de données créée.')
  // Initialise la base avec quelques données
  const passhash = await bcrypt.hash('Ab*123-!', 2)
  await userModel.create({
    firstName: 'Lukas',
    lastName: 'Loiodice',
    email: 'Lukas.Loiodice@grenoble-inp.fr',
    password: passhash,
    address: '12 rue hassoul',
    birthDate: Date('2002-09-17'),
    balance: 999999,
    isAdmin: true
  })
  await userModel.create({
    firstName: 'Admin',
    lastName: 'Admin',
    email: 'a@a.com',
    password: passhash,
    address: '12 rue hassoul',
    birthDate: Date('2002-09-17'),
    balance: 999999,
    isAdmin: true
  })
  const u1 = await userModel.create({
    firstName: 'Jordan',
    lastName: 'Josserand',
    email: 'jordan@josserand.com',
    password: passhash,
    address: '12 rue hassoul',
    birthDate: '2024-04-25T10:27:55.000Z',
    balance: 999999,
    isAdmin: false
  })
  const g1 = await gameModel.create({
    name: 'Machine à sous',
    page : 'slot-machine',
    picturePath: './images/slot-machine.png',
    description: 'Une machine à sous'
  })
  const g2 = await gameModel.create({
    name: 'Mines',
    page : 'mines',
    picturePath: './../../assets/mines.png',
    description: 'Un démineur'
  })
  const h1 = await historyModel.create({
    profit: -2,
    gameDate: '2024-04-25T10:27:55.000Z'
  })
  h1.setUser(u1)
  h1.setGame(g1)
  const h2 = await historyModel.create({
    profit: 4,
    gameDate: '2024-04-23T10:27:55.000Z'
  })
  h2.setUser(u1)
  h2.setGame(g2)
  const h3 = await historyModel.create({
    profit: 15,
    gameDate: '2024-05-23T10:27:55.000Z'
  })
  h3.setUser(u1)
  h3.setGame(g2)
})()
