const DB = require('../utils/db-util')
const TABLE = 'client_account'

const client_account = {
  async getAccountByFilter(filter, cols = '*') {
    let { where, values } = DB.mapToDbParams(filter)
    return await DB.queryForObj(TABLE, cols, where, values);
  },
  async addAccount(account) {
    return await DB.insert(TABLE, account)
  }
}

module.exports = client_account
