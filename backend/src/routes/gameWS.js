const express = require('express')
const router = express.Router()
const gameWS = require('../controllers/gameWS')
const userModel = require('../models/users')
const jws = require('jws')
const { TOKENSECRET } = process.env

router.get('/gameSocket', function (req, res, next) {
    res.end()
})

router.ws('/gameSocket', function (ws, req) {
    ws.on('message', async function (msg) {
        if (!msg) {
            ws.send(JSON.stringify({ error: 'msg required' }))
            return
        }

        const jsonMSG = JSON.parse(msg)

        // Check user msg
        if (!jsonMSG?.game || !jsonMSG?.Payload || !jsonMSG?.userToken) {
            ws.send(JSON.stringify({ error: 'invalid msg request' }))
            return
        }

        // Get and check user
        if (!jws.verify(jsonMSG.userToken, 'HS256', TOKENSECRET)) {
            ws.send(JSON.stringify({ error: 'invalid token' }))
            return
        }

        const user = await userModel.findOne({
            where: { email: jws.decode(jsonMSG.userToken).payload }
        })

        if (!user) {
            ws.send(JSON.stringify({ error: 'user not found' }))
            return
        }

        // Verify game
        if (!gameWS[jsonMSG.game]) {
            ws.send(JSON.stringify({ error: 'game not found' }))
            return
        }

        // Call right game
        gameWS[jsonMSG.game](jsonMSG, ws, user)
    })
})

module.exports = router
