const userModel = require('../models/users.js')
const bcrypt = require('bcrypt');
// Ajouter ici les nouveaux require des nouveaux modèles

// eslint-disable-next-line no-unexpected-multiline
(async () => {
  // Regénère la base de données
  await require('../models/database.js').sync({ force: true })
  console.log('Base de données créée.')
  // Initialise la base avec quelques données
  const passhash = await bcrypt.hash('ab*123456', 2)
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
  await userModel.create({
    firstName: 'Jordan',
    lastName: 'Josserand',
    email: 'jordan@josserand.com',
    password: passhash,
    address: '12 rue hassoul',
    birthDate: '2024-04-25T10:27:55.000Z',
    balance: 999999,
    isAdmin: false
  })
})()
