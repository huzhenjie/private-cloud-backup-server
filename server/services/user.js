const Util = require('../utils/index')
const JWT = require('../utils/jwt')
const ClientAccountModel = require('../models/client-account')

module.exports.register = async (username, pwd, nick) => {
  const accountExist = await ClientAccountModel.getAccountByFilter({ username }, 'uid')
  if (accountExist) {
    throw new Error('Username already exists')
  }
  const salt = Util.randomStr(8)
  const uid = Util.randomStr(16)
  const db_pwd = Util.md5(pwd, `${uid}:${salt}`)
  const now = Date.now();
  return await ClientAccountModel.addAccount({
    uid,
    username,
    salt,
    nick,
    pwd: db_pwd,
    create_time: now,
    update_time: now
  })
}

function createTokenInfo(uid, salt) {
  const create_time = Date.now()
  const secret = Util.md5(`${uid}:${salt}`)
  const access_token = JWT.encrypt({
    uid,
    create_time
  }, secret, '1d')

  const refresh_token = JWT.encrypt({
    uid,
    create_time
  }, secret, '30d')

  const access_token_expire_in = 86400 * 1000
  const refresh_token_expire_in = 30 * 86400 * 1000
  return {
    uid,
    access_token,
    refresh_token,
    access_token_expire_in,
    refresh_token_expire_in
  }
}

module.exports.login = async (username, pwd) => {
  const account = await ClientAccountModel.getAccountByFilter({ username }, 'uid, pwd, salt, username, nick')
  if (!account) {
    throw new Error('Username or password is incorrect')
  }
  const db_pwd = Util.md5(pwd, `${account.uid}:${account.salt}`)
  if (db_pwd !== account.pwd) {
    throw new Error('Username or password is incorrect')
  }

  const token_info = createTokenInfo(account.uid, account.salt)

  return {
    account_info: {
      username: account.username,
      nick: account.nick
    },
    token_info
  }
}
