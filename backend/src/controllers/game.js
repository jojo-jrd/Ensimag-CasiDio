const gameModel = require('../models/games.js')
const has = require('has-keys')
const util = require('../util/utils.js')
const status = require('http-status')
const CodeError = require('../util/CodeError.js')

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
  },
  async addGame(req, res) {
    // #swagger.tags = ['Admin Games']
    // #swagger.summary = 'Add a new game'
    // #swagger.parameters['obj'] = { in: 'body', description:'Game informations', schema: { $name: 'Poker', $picturePath: 'pictures/poker', $description: 'Jeu de poker simple' }}
    if (!has(req.body, ['name', 'picturePath', 'description'])) throw new CodeError('You must specify the mandatory fiels', status.BAD_REQUEST)

    const { name, picturePath, description } = req.body

    await gameModel.create({name, picturePath, description})
    
    res.json({status: true, message: 'Game added'})
  },
  async updateGame(req, res) {
    // #swagger.tags = ['Admin Games']
    // #swagger.summary = 'Update existing game'
    // #swagger.parameters['obj'] = { in: 'body', description:'Game informations', schema: { $name: 'Poker', $picturePath: 'pictures/poker', $description: 'Jeu de poker simple' }}
    if (!has(req.params, 'id')) throw new CodeError('You must specify the game id', status.BAD_REQUEST)
    const { id } = req.params

    const game = await gameModel.findOne({ where: {id: id} })
    
    if (game) {
      game.name = util.getFieldsIfExist(req.body.name, game.name)
      game.picturePath = util.getFieldsIfExist(req.body.picturePath, game.picturePath)
      game.description = util.getFieldsIfExist(req.body.description, game.description)

      await game.save()

      res.json({status: true, message: 'Game updated'})
    } else {
      res.status(status.NOT_FOUND).json({status: false, message: 'Game not found'})
    }
  },
  async deleteGame(req, res) {
    // #swagger.tags = ['Admin Games']
    // #swagger.summary = 'Delete existing game'
    if (!has(req.params, 'id')) throw new CodeError('You must specify the game id', status.BAD_REQUEST)

    const {id} = req.params

    const game = await gameModel.findOne({ where: {id: id} })
    
    if (game) {
      game.destroy()

      res.json({status: true, message: 'Game deleted'})
    } else {
      res.status(status.NOT_FOUND).json({status: false, message: 'Game not found'})
    }
  }
}