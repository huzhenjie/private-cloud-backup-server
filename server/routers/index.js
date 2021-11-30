const Router = require('koa-router')()
const DefaultController = require('../controllers')
const FileRouter = require('./file')

Router.all('/test', DefaultController.test)
Router.use('/api/v1/file', FileRouter.routes(), FileRouter.allowedMethods())

module.exports = Router
