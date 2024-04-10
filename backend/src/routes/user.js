const express = require('express')
const router = express.Router()
const user = require('../controllers/user.js')

router.post('/login', user.login)
router.post('/register', user.newUser)
router.get('/api/users', user.validToken, user.getUsers)

module.exports = router
