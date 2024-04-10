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
    // #swagger.parameters['obj'] = { in: 'body', schema: { $email: 'John.Doe@acme.com', $password: '12345'}}
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
    // #swagger.parameters['obj'] = { in: 'body', description:'Create a new user', schema: { $name: 'John Doe', $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!'}}
    if (!has(req.body, ['name', 'email', 'password'])) throw new CodeError('You must specify the name and email', status.BAD_REQUEST)
    const { name, email, password } = req.body
    console.log(req.body)
    if (!validPassword(password)) throw new CodeError('Weak password!', status.BAD_REQUEST)
    await userModel.create({ name, email, password: await bcrypt.hash(password, 2) })
    res.json({ status: true, message: 'User Added' })
  },
  async getUsers (req, res) {
    // TODO : verify if the token is valid...
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get All users'
    const data = await userModel.findAll({ attributes: ['id', 'name', 'email'] })
    res.json({ status: true, message: 'Returning users', data })
  }
}
