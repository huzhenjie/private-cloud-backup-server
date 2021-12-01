// const Path = require('path')
const FS = require('fs')
const FileUtil = require('../utils/file')
const Config = require('../../config')
const FileModel = require('../models/file')
const FileService = require('../services/file')

// curl -X POST -F 'file=@/Users/huzhenjie/Downloads/key.zip' http://localhost:5233/api/v1/file
module.exports.upload = async ctx => {
  const file = ctx.request.files.file
  const reader = FS.createReadStream(file.path)
  const file_dir = Config.path.source_path
  const server_path = file_dir + file.name
  const origin_file_md5 = await FileUtil.fileMd5ByStream(reader)
  console.log(server_path)
  // const writer = FS.createWriteStream(server_path)
  // reader.pipe(writer)
  ctx.body = {
    size: file.type,
    code: 200,
    msg: 'upload success'
  }
}

module.exports.h5UploadApply = async ctx => {
  const file_info_list = ctx.request.body
  try {
    const data = await FileService.h5UploadApply(file_info_list)
    ctx.body = {
      data,
      code: 200,
      msg: 'ok'
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      msg: e.message
    }
  }
}

module.exports.h5Upload = async ctx => {
  const { tmp_file_id, offset } = ctx.params
  if (!ctx.request.files) {
    ctx.body = {
      code: 500,
      msg: 'file required'
    }
    return
  }
  const file = ctx.request.files.file
  try {
    await FileService.h5Upload(tmp_file_id, offset, file)
    ctx.body = {
      code: 200,
      msg: 'ok'
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      msg: e.message
    }
  }
}

module.exports.h5Combine = async ctx => {
  const { tmp_file_id } = ctx.params
  try {
    await FileService.h5Combine(tmp_file_id)
    ctx.body = {
      code: 200,
      msg: 'ok'
    }
  } catch (e) {
    ctx.body = {
      code: 500,
      msg: e.message
    }
  }
}
