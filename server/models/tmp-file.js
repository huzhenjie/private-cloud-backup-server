const DB = require('../utils/db-util');

const TABLE = 'tmp_file';

const tmp_file = {
  STATE_OK: 1,
  async addFile(file) {
    return await DB.insertGetId(TABLE, file);
  },
  async getFile(id, cols = '*') {
    return await DB.queryForObj(TABLE, cols, 'id=?', [id]);
  },
  async updateFile(id, file) {
    return await DB.update(TABLE, file, 'id=?', [id]);
  },
  async removeFile(id) {
    return await DB.remove(TABLE, 'id=? LIMIT 1', [id]);
  }
}

module.exports = tmp_file
