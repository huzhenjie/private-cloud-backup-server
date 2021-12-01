const Send = require('koa-send')
const FileService = require('../services/file')

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
    console.error(e)
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

module.exports.download = async ctx => {
  const { file_id } = ctx.params
  try {
    const file = await FileService.getFile(file_id, 'server_path,file_name')
    if (!file) {
      ctx.body = {
        code: 500,
        msg: 'file not found'
      }
      return
    }
    ctx.attachment(file.file_name)
    await Send(ctx, file.server_path, { root: '/'})
  } catch (e) {
    ctx.body = {
      code: 500,
      msg: e.message
    }
  }
}
