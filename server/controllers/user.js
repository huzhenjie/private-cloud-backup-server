const UserService = require('../services/user')

module.exports.login = async ctx => {
  const { username, pwd } = ctx.request.body
  try {
    const data = await UserService.login(username, pwd)
    ctx.body = {
      data,
      code: 200,
      msg: 'ok'
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      msg: e.message
    }
  }

}

module.exports.register = async ctx => {
  const { username, pwd, nick } = ctx.request.body

  try {
    const success = await UserService.register(username, pwd, nick)
    if (success) {
      ctx.body = {
        code: 200,
        msg: 'ok'
      }
    } else {
      ctx.body = {
        code: -1,
        msg: 'Register failed'
      }
    }
  } catch (err) {
    ctx.body = {
      code: -1,
      msg: err.message
    }
  }
}
