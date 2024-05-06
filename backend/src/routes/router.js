const router = require('express').Router()
router.use(require('./user'))
router.use(require('./game'))
router.use(require('./history'))
router.use(require('./gameWS'))
module.exports = router
