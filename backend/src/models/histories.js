const Sequelize = require('sequelize')
const db = require('./database.js')
const userModel = require('./users.js')
const gameModel = require('./games.js')
const histories = db.define('histories', {
  profit: {
    type: Sequelize.FLOAT
  },
  gameDate: {
    type: Sequelize.DATE
  }
}, { timestamps: false })
histories.belongsTo(userModel, { through: 'userID' })
histories.belongsTo(gameModel, { through: 'gameID' })
module.exports = histories
