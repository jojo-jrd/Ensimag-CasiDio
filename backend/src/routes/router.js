const router = require('express').Router()
router.use(require('./user'))
router.use(require('./game'))
router.use(require('./history'))
module.exports = router
