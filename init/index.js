const Path = require('path')
const Koa = require('koa')
const BodyParser = require('koa-bodyparser')
const KoaLogger = require('koa-logger')
const KoaStatic = require('koa-static')
const KoaCors = require('koa2-cors')
const Util = require('../server/utils')
const Router = require('../server/routers')
const Config = require('../config')
const Schedule = require('../server/schedules')

const App = new Koa()
App.use(KoaLogger())
App.use(BodyParser())
App.use(KoaCors())
App.use(KoaStatic(Path.join(__dirname, '../static/')))
App.use(Router.routes()).use(Router.allowedMethods())
App.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = '404 - Not found'
})

const SERVER_PORT = Config.port
App.listen(SERVER_PORT)
console.log(`App running at:\n- Local:\thttp://localhost:${SERVER_PORT}`)
const server_ip = Util.getIPAddress()
if (server_ip) {
  console.log(`- Network:\thttp://${server_ip}:${SERVER_PORT}`)
}
Schedule.init()
