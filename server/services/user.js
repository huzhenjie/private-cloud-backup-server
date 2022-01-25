const Util = require('../utils/index')
const JWT = require('../utils/jwt')
const RedisUtil = require('../utils/redis-util')
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

async function createTokenInfo(uid) {
  const token_type = Util.randomStr(8)
  const access_token_val = Util.randomStr(32)
  const access_token = token_type + "_" + access_token_val
  const access_token_expire_in = 86400
  await RedisUtil.set(`AccessToken:${uid}:${token_type}`, access_token_val, access_token_expire_in)

  const refresh_token_val = Util.randomStr(32)
  const refresh_token = token_type + "_" + refresh_token_val
  const refresh_token_expire_in = 30 * 86400
  await RedisUtil.set(`RefreshToken:${uid}:${token_type}`, refresh_token_val, refresh_token_expire_in)

  return {
    uid,
    access_token,
    refresh_token,
    access_token_expire_in,
    refresh_token_expire_in
  }
}

module.exports.isAccessTokenOk = async (uid, access_token_str) => {
  const token_arr = access_token_str.split('_')
  if (token_arr.length !== 2) {
    return false
  }
  const [ token_type, access_token ] = token_arr
  const cache_access_token = await RedisUtil.get(`AccessToken:${uid}:${token_type}`)
  return access_token === cache_access_token
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

  const token_info = await createTokenInfo(account.uid)

  return {
    account_info: {
      username: account.username,
      nick: account.nick
    },
    token_info
  }
}
