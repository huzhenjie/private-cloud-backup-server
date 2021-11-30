const DB = require('../utils/db-util');

const TABLE = 'tmp_file_chunk';

const tmp_file = {
  STATE_OK: 1,
  async addChunk(chunk) {
    return await DB.insert(TABLE, chunk);
  },
  async getChunk(id) {
    return await DB.queryForObj(TABLE, '*', 'id=?', [id]);
  },
  async getChunkByTmpFileId(tmp_file_id, offset, cols = '*') {
    return await DB.queryForObj(TABLE, cols, 'tmp_file_id=? AND offset=?', [tmp_file_id, offset]);
  },
  async updateChunk(id, chunk) {
    return await DB.update(TABLE, chunk, 'id=? limit 1', [id]);
  },
  async getChunksByTmpFileId(tmp_file_id, cols = '*') {
    return await DB.queryForList(TABLE, cols, 'tmp_file_id=? order by offset asc', [tmp_file_id]);
  },
  async removeChunks(tmp_file_id) {
    return await DB.remove(TABLE, 'tmp_file_id=? limit 1', [tmp_file_id]);
  }
}

module.exports = tmp_file
