const express = require('express')
const router = express.Router()
const game = require('../controllers/game')

router.get('/games', game.getGames)

module.exports = router
