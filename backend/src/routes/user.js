const express = require('express')
const router = express.Router()
const user = require('../controllers/user.js')

router.post('/login', user.login)
router.post('/register', user.newUser)
router.get('/api/user', user.validToken, user.getUser)
router.put('/api/user', user.validToken, user.updateUser)
router.delete('/api/user', user.validToken, user.deleteUser)
router.get('/api/users', user.validToken, user.verifyAdmin, user.getUsers)
router.put('/api/user/:id', user.validToken, user.verifyAdmin, user.adminUpdateUser)
router.delete('/api/user/:id', user.validToken, user.verifyAdmin, user.adminDeleteUser)
router.put('/api/userBalance/:id', user.validToken, user.verifyAdmin, user.updateBalance)
module.exports = router
