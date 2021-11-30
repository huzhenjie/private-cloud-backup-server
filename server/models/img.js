const DB = require('../utils/db-util');

const TABLE = 'img';

const img = {
 async addImg(img) {
  return await DB.insertGetId(TABLE, img);
 },
 async getImgListByImgName(img_name, size = 10) {
  return await DB.queryForList(TABLE, 'id', 'img_name=? limit ?', [ img_name, size ]);
 }
}

module.exports = img
