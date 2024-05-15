const historyModel = require('../models/histories.js')
const sequelize = require('sequelize')

module.exports = {
  async getHistory (req, res) {
    // #swagger.tags = ['Histories']
    // #swagger.summary = 'Get all history of the user'

    // Get datas for the line chart
    // SELECT Date(gameDate, month-years), sum(profit)
    // FROM histories
    // WHERE userID = req.userID
    // GROUP BY Date(gameDate, month-years)
    // ORDER BY gameDate
    const evolutionSolde = await historyModel.findAll({
      attributes: [
        [sequelize.fn('strftime', '%m-%Y', sequelize.col('gameDate')), 'date'],
        [sequelize.fn('sum', sequelize.col('profit')), 'total_amount']
      ],
      where: { userID: req.userID },
      group: [sequelize.fn('strftime', '%m-%Y', sequelize.col('gameDate'))],
      order: [['gameDate', 'ASC']]
    })

    // Get the last week profit
    // Get the date range of the week
    const currentDate = new Date()

    const first = currentDate.getDate() - currentDate.getDay()
    const last = first + 6

    const firstDay = new Date(currentDate.setDate(first))
    const lastDay = new Date(currentDate.setDate(last))

    // perform the request
    const evolutionSoldeWeek = await historyModel.findAll({
      attributes: [
        [sequelize.fn('sum', sequelize.col('profit')), 'total_amount']
      ],
      where: {
        userID: req.userID,
        gameDate: {
          [sequelize.Op.between]: [firstDay, lastDay]
        }
      }
    })

    res.json({
      status: true,
      message: 'Returning user history',
      data: {
        evolutionSolde: evolutionSolde,
        evolutionSoldeWeek: evolutionSoldeWeek[0]
      }
    })
  },
  async getGlobalHistory (req, res) {
    // #swagger.tags = ['Histories']
    // #swagger.summary = 'Get all history of all the users'

    // Get datas for the line chart
    // SELECT Date(gameDate, month-years), sum(profit)
    // FROM histories
    // WHERE userID = req.userID
    // GROUP BY Date(gameDate, month-years)
    // ORDER BY gameDate
    const evolutionSolde = await historyModel.findAll({
      attributes: [
        [sequelize.fn('strftime', '%m-%Y', sequelize.col('gameDate')), 'date'],
        [sequelize.fn('sum', sequelize.col('profit')), 'total_amount']
      ],
      group: [sequelize.fn('strftime', '%m-%Y', sequelize.col('gameDate'))],
      order: [['gameDate', 'ASC']]
    })

    // Get the last week profit
    // Get the date range of the week
    const currentDate = new Date()

    const first = currentDate.getDate() - currentDate.getDay()
    const last = first + 6

    const firstDay = new Date(currentDate.setDate(first))
    const lastDay = new Date(currentDate.setDate(last))

    // perform the request
    const evolutionSoldeWeek = await historyModel.findAll({
      attributes: [
        [sequelize.fn('sum', sequelize.col('profit')), 'total_amount']
      ],
      where: {
        gameDate: {
          [sequelize.Op.between]: [firstDay, lastDay]
        }
      }
    })

    res.json({
      status: true,
      message: 'Returning global history',
      data: {
        evolutionSolde: evolutionSolde,
        evolutionSoldeWeek: evolutionSoldeWeek[0]
      }
    })
  }
}
