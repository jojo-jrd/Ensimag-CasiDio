const Sequelize = require('sequelize')
const db = require('./database.js')
const users = db.define('users', {
  firstName: {
    type: Sequelize.STRING(128),
    validate: {
      is: /^[a-z\-'\s]{1,128}$/i
    }
  },
  lastName: {
    type: Sequelize.STRING(128),
    validate: {
      is: /^[a-z\-'\s]{1,128}$/i
    }
  },
  email: {
    primaryKey: true,
    type: Sequelize.STRING(128),
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING(60),
    validate: {
      is: /^[0-9a-z\\/$.]{60}$/i
    }
  },
  birthDate: {
    type: Sequelize.DATE,
  },
  balance: {
    type : Sequelize.FLOAT
  },
  isAdmin: {
    type : Sequelize.BOOLEAN,
    defaultValue : false
  }
}, { timestamps: false })
module.exports = users
