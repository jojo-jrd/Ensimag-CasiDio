const express = require('express')
const router = express.Router()
const user = require('../controllers/user')
const history = require('../controllers/history')

router.get('/api/history', user.validToken, history.getHistory)

module.exports = router
