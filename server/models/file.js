const DB = require('../utils/db-util');

const TABLE = 'file';

const file = {
  CLIENT_TYPE_H5: 1,
  CLIENT_TYPE_ANDROID: 2,
  CLIENT_TYPE_IOS: 3,
  async addFile(file) {
    return await DB.insert(TABLE, file);
  },
  async getFileListByFilter(filter, cols = '*', offset = 0, size = 10) {
    let { where, values } = DB.mapToDbParams(filter)
    where += ` AND delete_time = 0 order by create_time desc limit ?,?`
    values = values.concat([offset, size])
    return await DB.queryForList(TABLE, cols, where, values);
  },
  async getFileCntByFilter(filter) {
    let { where, values } = DB.mapToDbParams(filter)
    where += ` AND delete_time = 0`
    return await DB.count(TABLE, where, values);
  }
}

module.exports = file
