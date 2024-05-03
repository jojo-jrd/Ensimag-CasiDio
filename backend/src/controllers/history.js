const historyModel = require('../models/histories.js')
const has = require('has-keys')
const util = require('../util/utils.js')
const status = require('http-status')
const CodeError = require('../util/CodeError.js')
const sequelize  = require('sequelize')

module.exports = {
  async getHistory(req, res) {
    // #swagger.tags = ['Histories']
    // #swagger.summary = 'Get all history of the user'
    const data = await historyModel.findAll({
      attributes: [
        [sequelize.fn('strftime', '%m-%Y', sequelize.col('gameDate')), 'date'],
        [sequelize.fn('sum', sequelize.col('profit')), 'total_amount']
      ],
      where: { userID: req.userID },
      group: [sequelize.fn('strftime', '%m-%Y', sequelize.col('gameDate'))],
      order :[['gameDate', 'ASC']]
    })
    
    if (data) {
      res.json({status: true, message: 'Returning user history', data})
    } else {
      res.status(status.NOT_FOUND).json({status: false, message: 'History not found'})
    }
  }
}