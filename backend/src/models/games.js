const Sequelize = require('sequelize')
const db = require('./database.js')
const games = db.define('games', {
  name: {
    type: Sequelize.STRING(128),
    unique: true,
    validate: {
      is: /^[a-z\-'\s]{1,128}$/i
    }
  },
  picturePath: {
    type: Sequelize.STRING(128),
    validate: {
      is: /^(\/?[a-zA-Z0-9_\-]+)+(\.[a-zA-Z0-9]+)?$/i
    }
  },
  description: {
    type: Sequelize.STRING(1024),
  }
}, { timestamps: false })
module.exports = games
