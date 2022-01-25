const Send = require('koa-send')
const FileService = require('../services/file')

module.exports.h5UploadApply = async ctx => {
  const uid = ctx.uid
  const file_info_list = ctx.request.body
  try {
    const data = await FileService.h5UploadApply(uid, file_info_list)
    ctx.body = {
      data,
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

module.exports.h5Upload = async ctx => {
  const uid = ctx.uid
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
    await FileService.h5Upload(uid, tmp_file_id, offset, file)
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
  const uid = ctx.uid
  const { tmp_file_id } = ctx.params
  try {
    await FileService.h5Combine(uid, tmp_file_id)
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

module.exports.download = async ctx => {
  const uid = ctx.uid
  const { file_id } = ctx.params
  try {
    const file = await FileService.getFile(uid, file_id, 'server_path,file_name')
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
    console.error(e)
    ctx.body = {
      code: 500,
      msg: e.message
    }
  }
}

module.exports.delFile = async ctx => {
  const uid = ctx.uid
  const { file_id } = ctx.params
  await FileService.delFile(uid, file_id)
  ctx.body = {
    code: 200,
    msg: 'ok'
  }
}

module.exports.getImgList = async ctx => {
  const uid = ctx.uid
  const { last_id, last_file_time } = ctx.request.query
  const last_id_num = last_id ? parseInt(last_id) : 0
  const last_file_time_num = last_file_time ? parseInt(last_file_time) : 0
  const data = await FileService.getImgList(uid, last_id_num, last_file_time_num, 30)
  ctx.body = {
    data,
    code: 200,
    msg: 'ok'
  }
}
