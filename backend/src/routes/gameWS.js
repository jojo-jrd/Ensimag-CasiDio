const express = require('express')
const router = express.Router()
const gameWS = require('../controllers/gameWS')

router.get('/gameSocket', function(req, res, next){
    res.end();
});

router.ws('/gameSocket', function(ws, req) {
    ws.on('message', function(msg) {
        const jsonMSG = JSON.parse(msg)

        gameWS[`${jsonMSG.game}`](jsonMSG, ws)
    })
})

module.exports = router
