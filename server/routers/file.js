const Router = require('koa-router')()
const H5FileController = require('../controllers/h5-file')
const KoaBody = require('koa-body')({multipart: true})

const routers = Router
  .post(`/`, KoaBody, H5FileController.upload)
  .post(`/h5/upload/apply`, H5FileController.h5UploadApply)
  .post(`/h5/upload/:tmp_file_id/combine`, KoaBody, H5FileController.h5Combine)
  .post(`/h5/upload/:tmp_file_id/:offset`, KoaBody, H5FileController.h5Upload)

module.exports = routers
