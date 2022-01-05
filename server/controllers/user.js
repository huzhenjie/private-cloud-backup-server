const UserService = require('../services/user')

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
