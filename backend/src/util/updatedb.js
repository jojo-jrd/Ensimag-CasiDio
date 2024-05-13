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
  const u2 = await userModel.create({
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
    page : 'SlotMachine',
    picturePath: './images/slot-machine.png',
    description: 'Plongez dans l\'excitation de notre machine à sous en ligne où vous alignerez trois symboles pour gagner des Viardots. Avec des graphismes captivants et des récompenses éblouissantes, chaque tour est une aventure en soi. Tournez les rouleaux et laissez-vous emporter par le frisson de la victoire !'
  })
  const g2 = await gameModel.create({
    name: 'Mines',
    page : 'MineGame',
    picturePath: './images/mines.png',
    description: 'Plongez dans le Casino des Mines, où chaque tuile cache un secret : les étoiles mènent à la richesse, tandis que les bombes annoncent la catastrophe. Naviguez intelligemment à travers la grille pour révéler les étoiles, multipliant vos gains à chaque choix sûr. Mais attention ! Un seul faux pas pourrait faire exploser vos chances, mettant fin à la manche et réinitialisant vos gains. Testez votre chance et votre stratégie dans ce jeu palpitant de risque et de récompense !'
  })
  const g3 = await gameModel.create({
    name: 'Roulette',
    page : 'RouletteGame',
    picturePath: './images/roulette.png',
    description: 'Découvrez l\'excitation de la roulette dans le confort de votre maison avec CasiDio ! Plongez dans l\'ambiance électrisante d\'un casino en ligne et misez sur vos numéros chanceux. Avec des graphismes saisissants et des fonctionnalités conviviales, notre jeu de roulette offre une expérience immersive inégalée. Testez votre chance dès aujourd\'hui et voyez si la roue tourne en votre faveur sur CasiDio !'
  })
  const h1 = await historyModel.create({
    profit: -2,
    gameDate: '2023-04-25T10:27:55.000Z'
  })
  h1.setUser(u1)
  h1.setGame(g1)
  const h2 = await historyModel.create({
    profit: 4,
    gameDate: '2023-04-23T10:27:55.000Z'
  })
  h2.setUser(u1)
  h2.setGame(g2)
  const h3 = await historyModel.create({
    profit: 15,
    gameDate: '2023-05-23T10:27:55.000Z'
  })
  h3.setUser(u1)
  h3.setGame(g2)
  const h4 = await historyModel.create({
    profit: 200,
    gameDate: '2024-04-23T10:27:55.000Z'
  })
  h4.setUser(u2)
  h4.setGame(g1)
  const h5 = await historyModel.create({
    profit: 18,
    gameDate: '2023-04-27T10:27:55.000Z'
  })
  h5.setUser(u1)
  h5.setGame(g3)
  const h6 = await historyModel.create({
    profit: -25,
    gameDate: '2023-04-21T10:27:55.000Z'
  })
  h6.setUser(u1)
  h6.setGame(g3)
})()
