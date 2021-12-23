const DB = require('../utils/db-util')
const FileUtil = require('../utils/file')

const TABLE = 'backup_file'

const backup_file = {
  CLIENT_TYPE_H5: 1,
  CLIENT_TYPE_ANDROID: 2,
  CLIENT_TYPE_IOS: 3,
  async addFile(file) {
    return await DB.insert(TABLE, file)
  },
  async getFile(id, cols = '*') {
    return await DB.queryForObj(TABLE, cols, 'id=? AND delete_time=0', [id])
  },
  async delFile(id) {
    return await DB.update(TABLE, { delete_time: Date.now() }, 'id=? LIMIT 1', [id])
  },
  async removeFile(id) {
    return await DB.remove(TABLE, 'id=? LIMIT 1', [id])
  },
  async getFileByMd5(md5, cols = '*') {
    return await DB.queryForObj(TABLE, cols, 'file_md5=? AND delete_time=0', [md5])
  },
  async getFileListByFilter(filter, cols = '*', offset = 0, size = 10) {
    let { where, values } = DB.mapToDbParams(filter)
    where += ` AND delete_time=0 ORDER BY create_time DESC LIMIT ?,?`
    values = values.concat([offset, size])
    return await DB.queryForList(TABLE, cols, where, values)
  },
  async getFileCntByFilter(filter) {
    let { where, values } = DB.mapToDbParams(filter)
    where += ` AND delete_time=0`
    return await DB.count(TABLE, where, values)
  },
  async getImgList(file_time, cols = '*', size = 10) {
    const values = []
    let where = 'file_type IN ('
    where += FileUtil.imgFileTypes.reduce((res, item) => {
      res += `?,`
      values.push(item)
      return res
    }, '')
    where = where.substr(0, where.length - 1)
    where += ') '
    if (file_time > 0) {
      where += 'AND file_time<=? '
      values.push(file_time)
    }
    where += 'AND delete_time=0 ORDER BY file_time DESC, id DESC LIMIT ?'
    values.push(size)
    return await DB.queryForList(TABLE, cols, where, values)
  },
  async getDeletedFileList(cols, trash_time, id = 0, size = 10) {
    const where = 'id>? AND delete_time > 0 AND delete_time<=? ORDER BY id LIMIT ?'
    return await DB.queryForList(TABLE, cols, where, [id, trash_time, size])
  }
}

module.exports = backup_file
