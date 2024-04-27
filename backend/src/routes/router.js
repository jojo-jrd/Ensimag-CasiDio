const router = require('express').Router()
router.use(require('./user'))
router.use(require('./game'))
module.exports = router
