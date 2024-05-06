const express = require('express')
const router = express.Router()
const gameWS = require('../controllers/gameWS')

router.get('/gameSocket', function(req, res, next){
    res.end();
});

router.ws('/gameSocket', function(ws, req) {
    ws.on('message', function(msg) {
        if (msg === '1') {
            ws.send('2')
        } else {
            ws.send('3')
        }
    })
})

module.exports = router
