const UserService = require('../../services/user')
const FileService = require('../../services/file')

const IGNORE_LIST = [
  '/api/v1/h5/login',
  '/api/v1/h5/account',
  '/favicon.ico',
  '/test'
]

const FILE_AUTH = [
  '/api/v1/h5/file'
]

module.exports = async (ctx, next) => {
  if (IGNORE_LIST.includes(ctx.path)) {
    return await next()
  }
  if (ctx.request.method === 'GET') {
    const is_file_auth = FILE_AUTH.some(item => ctx.path.startsWith(item))
    if (is_file_auth) {
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
  }

  const uid = ctx.headers['x-uid']
  const authorization = ctx.header.authorization
  console.log('xxxx', uid, authorization)
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
