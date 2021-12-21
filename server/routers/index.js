const Router = require('koa-router')()
const DefaultController = require('../controllers')
const H5Router = require('./h5')

Router.all('/test', DefaultController.test)
Router.use('/api/v1/h5', H5Router.routes(), H5Router.allowedMethods())

module.exports = Router
