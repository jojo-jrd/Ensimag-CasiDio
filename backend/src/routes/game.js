const express = require('express')
const router = express.Router()
const game = require('../controllers/game')
const user = require('../controllers/user')

router.get('/games', game.getGames)
router.post('/api/game', user.validToken, user.verifyAdmin, game.addGame)
router.put('/api/game/:id', user.validToken, user.verifyAdmin, game.updateGame)
router.delete('/api/game/:id', user.validToken, user.verifyAdmin, game.deleteGame)

module.exports = router
