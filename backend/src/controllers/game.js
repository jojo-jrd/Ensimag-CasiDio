const gameModel = require('../models/games.js')
const status = require('http-status')

module.exports = {
  async getGames(req, res) {
    // #swagger.tags = ['Games']
    // #swagger.summary = 'Get all curent games available'
    const data = await gameModel.findAll()

    if (data) {
      res.json({status: true, message: 'Returning all games', data})
    } else {
      res.status(status.INTERNAL_SERVER_ERROR).json({status: false, message: 'Internal server error'})
    }
  }
}