const status = require('http-status')
const userModel = require('../models/users.js')
const has = require('has-keys')
const CodeError = require('../util/CodeError.js')
const bcrypt = require('bcrypt')
const jws = require('jws')
require('mandatoryenv').load(['TOKENSECRET'])
const { TOKENSECRET } = process.env

function validPassword (password) {
  return /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(password)
}

module.exports = {
  validToken(req, res, next) {
    // #swagger.security = [{"apiKeyAuth": []}] 
    // If not x-access-token in headers => error
    if (!req.headers || !req.headers.hasOwnProperty('x-access-token'))
      throw new CodeError('Token missing', status.FORBIDDEN);

    // If the token is not valid
    if (!jws.verify(req.headers['x-access-token'], 'HS256', TOKENSECRET))
      throw new CodeError('Token invalid', status.FORBIDDEN);

    req.login = jws.decode(req.headers['x-access-token']).payload;
    next();
  },
  async verifyAdmin(req, res, next) {
		// Si l'utilisateur n'est pas admin on renvoie une erreur
		const user = await userModel.findOne({ where: {email: req.login}});
		if (!user?.isAdmin)
			throw new CodeError('You must be admin', status.FORBIDDEN);

		next();
	},
  async login (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Verify credentials of user using email and password and return token'
    // #swagger.parameters['obj'] = { in: 'body', schema: { $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!'}}
    if (!has(req.body, ['email', 'password'])) throw new CodeError('You must specify the email and password', status.BAD_REQUEST)
    const { email, password } = req.body
    const user = await userModel.findOne({ where: { email } })
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        const token = jws.sign({ header: { alg: 'HS256' }, payload: email, secret: TOKENSECRET })
        res.json({ status: true, message: 'Login/Password ok', token })
        return token
      }
    }
    res.status(status.FORBIDDEN).json({ status: false, message: 'Wrong email/password' })
  },
  async newUser (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'New User'
    // #swagger.parameters['obj'] = { in: 'body', description:'Create a new user', schema: { $firstName: 'John', $lastName: 'Doe', $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!', $birthDate: '11/30/2000'}}
    if (!has(req.body, ['firstName', 'lastName', 'email', 'password', 'birthDate'])) throw new CodeError('You must specify all the fields', status.BAD_REQUEST)

    const { firstName, lastName, email, password, birthDate } = req.body

    if (!validPassword(password)) throw new CodeError('Weak password!', status.BAD_REQUEST)
    await userModel.create({ firstName, lastName, email, password: await bcrypt.hash(password, 2), birthDate: new Date(birthDate), balance: 0})
    res.json({ status: true, message: 'User Added' })
  },
  async getUser (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get User Informations'
    const data = await userModel.findOne({
      where: {email: req.login},
      attributes: ['firstName', 'lastName', 'email', 'birthDate', 'balance', 'isAdmin']
    })

    if (data) {
      res.json({status: true, message: 'Returning user data', data})
    } else {
      res.status(status.INTERNAL_SERVER_ERROR).json({status: false, message: 'User not found'})
    }
  },
  async getUsers (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get All users'
    const data = await userModel.findAll({ attributes: ['id', 'name', 'email'] })
    res.json({ status: true, message: 'Returning users', data })
  }
}
