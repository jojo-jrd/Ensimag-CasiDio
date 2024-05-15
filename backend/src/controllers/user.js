const status = require('http-status')
const userModel = require('../models/users.js')
const has = require('has-keys')
const utils = require('../util/utils.js')
const CodeError = require('../util/CodeError.js')
const bcrypt = require('bcrypt')
const jws = require('jws')
require('mandatoryenv').load(['TOKENSECRET'])
const { TOKENSECRET } = process.env

function validPassword (password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-])[A-Za-z\d!@#$%^&*()-]{8,}$/.test(password)
}

module.exports = {
  async validToken (req, res, next) {
    // #swagger.security = [{"apiKeyAuth": []}]
    // If not x-access-token in headers => error
    if (!req.headers || !Object.prototype.hasOwnProperty.call(req.headers, 'x-access-token')) {
      res.status(status.FORBIDDEN).json({ status: false, message: 'You must be logged !' })
      throw new CodeError('Token missing', status.BAD_REQUEST)
    }

    // If the token is not valid
    if (!jws.verify(req.headers['x-access-token'], 'HS256', TOKENSECRET)) {
      res.status(status.FORBIDDEN).json({ status: false, message: 'You must be logged !' })
      throw new CodeError('Token missing', status.FORBIDDEN)
    }

    const login = jws.decode(req.headers['x-access-token']).payload

    const user = await userModel.findOne({ where: { email: login } })

    if (!user) {
      res.status(status.INTERNAL_SERVER_ERROR).json({ status: false, message: 'Server error' })
      throw new CodeError('Server error', status.INTERNAL_SERVER_ERROR)
    }

    req.userID = user.id

    next()
  },
  async verifyAdmin (req, res, next) {
    // Si l'utilisateur n'est pas admin on renvoie une erreur
    const user = await userModel.findOne({ where: { id: req.userID } })
    if (!user?.isAdmin)
      throw new CodeError('You must be admin', status.FORBIDDEN)

    next()
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
    // #swagger.parameters['obj'] = { in: 'body', description:'Create a new user', schema: { $firstName: 'John', $lastName: 'Doe', $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!', $address: '8 avenue de la rue', $birthDate: '11/30/2000'}}
    if (!has(req.body, ['firstName', 'lastName', 'email', 'password', 'birthDate'])) throw new CodeError('You must specify all the fields', status.BAD_REQUEST)

    const { firstName, lastName, email, password, address, birthDate } = req.body

    if (!validPassword(password)) throw new CodeError('Weak password!', status.BAD_REQUEST)
    await userModel.create({ firstName, lastName, email, password: await bcrypt.hash(password, 2), address, birthDate: new Date(birthDate), balance: 0 })
    res.json({ status: true, message: 'User Added' })
  },
  async getUser (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get User Informations'
    const data = await userModel.findOne({
      where: { id: req.userID },
      attributes: ['firstName', 'lastName', 'email', 'address', 'birthDate', 'balance', 'isAdmin']
    })

    if (data) {
      res.json({ status: true, message: 'Returning user data', data })
    } else {
      res.status(status.NOT_FOUND).json({ status: false, message: 'User not found' })
    }
  },
  async updateUser (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Update user'
    // #swagger.parameters['obj'] = { in: 'body', description:'Update Connected User', schema: { $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!', $firstName: 'John', $lastName: 'Doe', $address: '8 avenue de la rue', $birthDate: '11/30/2000'}}
    const user = await userModel.findOne({
      where: { id: req.userID },
      attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'address', 'birthDate']
    })

    if (user) {
      if (req.body.password) {
        if (!validPassword(req.body.password)) throw new CodeError('Weak password!', status.BAD_REQUEST)
        user.password = await bcrypt.hash(req.body.password, 2)
      }
      user.email = utils.getFieldsIfExist(req.body.email, user.email)
      user.firstName = utils.getFieldsIfExist(req.body.firstName, user.firstName)
      user.lastName = utils.getFieldsIfExist(req.body.lastName, user.lastName)
      user.address = utils.getFieldsIfExist(req.body.address, user.address)
      user.birthDate = utils.getFieldsIfExist(req.body.birthDate, user.birthDate)

      await user.save()

      res.json({ status: true, message: 'User updated' })
    } else {
      res.status(status.NOT_FOUND).json({ status: false, message: 'User not found' })
    }
  },
  async deleteUser (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Delete Current User'
    const user = await userModel.findOne({
      where: { id: req.userID }
    })

    if (user) {
      await user.destroy()

      res.json({ status: true, message: 'User deleted' })
    } else {
      res.status(status.NOT_FOUND).json({ status: false, message: 'User not found' })
    }
  },
  async getUsers (req, res) {
    // #swagger.tags = ['Admin Users']
    // #swagger.summary = 'Get All users'
    const data = await userModel.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'address', 'birthDate', 'balance', 'isAdmin']
    })

    if (data) {
      res.json({ status: true, message: 'Returnins users datas', data })
    } else {
      res.status(status.INTERNAL_SERVER_ERROR).json({ status: false, message: 'Users not founds' })
    }
  },
  async adminUpdateUser (req, res) {
    // #swagger.tags = ['Admin Users']
    // #swagger.summary = 'Update user passed parameters'
    // #swagger.parameters['obj'] = { in: 'body', description:'Update Connected User', schema: { $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!', $firstName: 'John', $lastName: 'Doe', $address: '8 avenue de la rue', $birthDate: '11/30/2000', $balance: 200, $isAdmin: false}}
    if (!has(req.params, 'id')) throw new CodeError('You must specify the user id', status.BAD_REQUEST)
    const { id } = req.params

    const user = await userModel.findOne({
      where: { id: id },
      attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'address', 'birthDate', 'balance', 'isAdmin']
    })
    if (user) {
      if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 2)
      }
      user.email = utils.getFieldsIfExist(req.body.email, user.email)
      user.firstName = utils.getFieldsIfExist(req.body.firstName, user.firstName)
      user.lastName = utils.getFieldsIfExist(req.body.lastName, user.lastName)
      user.address = utils.getFieldsIfExist(req.body.address, user.address)
      user.birthDate = utils.getFieldsIfExist(req.body.birthDate, user.birthDate)
      user.balance = utils.getFieldsIfExist(req.body.balance, user.balance)
      user.isAdmin = utils.getFieldsIfExist(req.body.isAdmin, user.isAdmin)

      await user.save()

      res.json({ status: true, message: 'User updated' })
    } else {
      res.status(status.NOT_FOUND).json({ status: false, message: 'User not found' })
    }
  },
  async adminDeleteUser (req, res) {
    // #swagger.tags = ['Admin Users']
    // #swagger.summary = 'Delete user passed in parameters'
    if (!has(req.params, 'id')) throw new CodeError('You must specify the user id', status.BAD_REQUEST)
    const { id } = req.params

    const user = await userModel.findOne({
      where: { id: id }
    })

    if (user) {
      user.destroy()

      res.json({ status: true, message: 'User deleted' })
    } else {
      res.status(status.NOT_FOUND).json({ status: false, message: 'User not found' })
    }
  }
}
