const Router = require('koa-router')()
const H5FileController = require('../controllers/h5-file')
const UserController = require('../controllers/user')
const KoaBody = require('koa-body')({multipart: true})

const routers = Router
  .get(`/file/:file_id`, H5FileController.download)
  .delete(`/file/:file_id`, H5FileController.delFile)
  .get(`/img`, H5FileController.getImgList)
  .post(`/account`, UserController.register)
  .post(`/upload/apply`, H5FileController.h5UploadApply)
  .post(`/upload/:tmp_file_id/combine`, KoaBody, H5FileController.h5Combine)
  .post(`/upload/:tmp_file_id/:offset`, KoaBody, H5FileController.h5Upload)

module.exports = routers
