const Util = require('../utils/index')
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
