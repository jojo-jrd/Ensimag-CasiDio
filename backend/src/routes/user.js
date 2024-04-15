const express = require('express')
const router = express.Router()
const user = require('../controllers/user.js')

router.post('/login', user.login)
router.post('/register', user.newUser)
router.get('/api/user', user.validToken, user.getUser)
router.put('/api/user', user.validToken, user.updateUser)
router.get('/api/users', user.validToken, user.verifyAdmin, user.getUsers)

module.exports = router
