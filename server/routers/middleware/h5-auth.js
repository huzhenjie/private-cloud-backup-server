const UserService = require('../../services/user')
const FileService = require('../../services/file')

const IGNORE_RULE = [
  '/api/v1/h5/login',
  '/api/v1/h5/account',
  '/favicon.ico',
  '/test'
]

const FILE_AUTH_RULE = [
  '/api/v1/h5/file'
]

async function dealWithFileAuth(ctx, next) {
  const token = ctx.request.query.token
  if (!token) {
    ctx.body = {
      code: 4440,
      msg: 'Token expired'
    }
    return
  }
  const path_arr = ctx.path.split('/')
  const id = path_arr[path_arr.length - 1]
  const file_token_info = await FileService.getFileTokenInfo(id, token)
  if (!file_token_info) {
    ctx.body = {
      code: 4441,
      msg: 'Token expired'
    }
    return
  }
  if (file_token_info.id !== parseInt(id)) {
    ctx.body = {
      code: 4442,
      msg: 'Token expired'
    }
    return
  }
  ctx.uid = file_token_info.uid
  return await next()
}

async function dealWithApiAuth(ctx, next) {
  const uid = ctx.header['x-uid']
  const authorization = ctx.header.authorization
  if (!uid || !authorization) {
    ctx.body = {
      code: 444,
      msg: 'Login required'
    }
    return
  }
  const token = authorization.replace('Bearer ', '')
  const token_ok = await UserService.isAccessTokenOk(uid, token)
  if (!token_ok) {
    ctx.body = {
      code: 444,
      msg: 'Token expired'
    }
    return
  }
  ctx.uid = uid
  await next()
}

module.exports = async (ctx, next) => {
  const { path, request } = ctx
  if (IGNORE_RULE.includes(path)) {
    return await next()
  }
  if (request.method === 'GET') {
    const is_file_auth = FILE_AUTH_RULE.some(item => path.startsWith(item))
    if (is_file_auth) {
      await dealWithFileAuth(ctx, next)
      return
    }
  }

  await dealWithApiAuth(ctx, next)
}
