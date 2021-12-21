const FS = require("fs")
const Config = require("../../config")
const BackupFileModel = require('../models/backup-file')
const TmpFileModel = require('../models/tmp-file')
const TmpFileChunkModel = require('../models/tmp-file-chunk')
const FileUtil = require("../utils/file")
const Util = require('../utils/index')

module.exports.h5UploadApply = async file_info_list => {
  return await Promise.all(file_info_list.map(async ({ file_name, file_type, file_size, file_time, width, height }) => {
    if (!file_size) {
      return {
        state: -1,
        msg: 'file size is empty'
      }
    }
    const exist_file_cnt = await BackupFileModel.getFileCntByFilter({file_name, file_type })
    const create_time = Date.now()
    const tmp_file_id = await TmpFileModel.addFile({
      file_size,
      file_name,
      file_type,
      create_time,
      width: width || 0,
      height: height || 0,
      file_time: file_time || create_time,
      client_type: BackupFileModel.CLIENT_TYPE_H5
    })
    const chunk_dir = Config.path.source_path + 'tmp/chunk/'
    FileUtil.mkdir(chunk_dir)
    let offset = 0
    const chunks = []
    while (offset < file_size) {
      const chunk_size = Math.min(Config.file.chunk_size, file_size - offset)
      const server_path = chunk_dir + Math.random().toString(36).slice(-10)
      await TmpFileChunkModel.addChunk({
        tmp_file_id,
        offset,
        chunk_size,
        server_path,
        create_time
      })
      chunks.push({
        offset,
        chunk_size,
        upload_url: `/api/v1/h5/upload/${tmp_file_id}/${offset}`
      })
      offset += Config.file.chunk_size
    }
    return {
      file_name,
      file_type,
      exist_file_cnt,
      chunks,
      id: tmp_file_id,
      state: 1
    }
  }))
}

module.exports.h5Upload = async (tmp_file_id, offset, file) => {
  if (!file) {
    throw new Error('file is required')
  }
  const tmp_file = await TmpFileModel.getFile(tmp_file_id, 'state')
  if (!tmp_file) {
    throw new Error('file apply info not found')
  }
  if (tmp_file.state === TmpFileModel.STATE_OK) {
    return
  }
  const chunk = await TmpFileChunkModel.getChunkByTmpFileId(tmp_file_id, offset, 'id,state,chunk_size,server_path')
  if (!chunk) {
    throw new Error('chunk not found')
  }
  if (chunk.state === TmpFileChunkModel.STATE_OK) {
    return
  }
  if (file.size !== chunk.chunk_size) {
    throw new Error('chunk size not match')
  }
  const reader = FS.createReadStream(file.path)
  const server_path = chunk.server_path
  const writer = FS.createWriteStream(server_path)
  reader.pipe(writer)
  await TmpFileChunkModel.updateChunk(chunk.id, {
    state: TmpFileChunkModel.STATE_OK
  })
}

module.exports.h5Combine = async tmp_file_id => {
  const tmp_file = await TmpFileModel.getFile(
    tmp_file_id,
    'state,file_name,file_size,file_md5,file_type,file_time,client_type,origin_path,width,height'
  )
  if (!tmp_file) {
    throw new Error('file apply info not found')
  }
  const { state, file_name, file_size, file_md5, file_type, file_time, client_type, origin_path, width, height } = tmp_file
  if (state === TmpFileModel.STATE_OK) {
    console.log('file already combine')
    return
  }
  const chunks = await TmpFileChunkModel.getChunksByTmpFileId(tmp_file_id, 'offset,chunk_size,server_path,state')
  if (chunks.length === 0) {
    throw new Error('chunks not found')
  }
  const chunk_not_all_ok = chunks.some(chunk => chunk.state !== TmpFileChunkModel.STATE_OK)
  if (chunk_not_all_ok) {
    throw new Error('chunks not all ok')
  }
  const dir = Config.path.source_path + 'file/' + Util.fmtDatetime(Date.now(), 'yyyyMMdd') + '/'
  let server_path = FileUtil.getAbsServerPath(dir, file_name)
  const chunk_paths = chunks.map(item => item.server_path)
  await FileUtil.combineFile(server_path, chunk_paths)
  const curr_file_size = FileUtil.fileSize(server_path)
  if (curr_file_size !== file_size) {
    FileUtil.delFile(server_path)
    throw new Error('file size not match')
  }
  const md5 = await FileUtil.fileMd5(server_path)
  if (file_md5 && md5 !== file_md5) {
    FileUtil.delFile(server_path)
    throw new Error('file md5 not match')
  }
  const exist_file = await BackupFileModel.getFileByMd5(md5, 'server_path')
  if (exist_file) {
    if (FS.existsSync(exist_file.server_path)) {
      FileUtil.delFile(server_path)
      server_path = exist_file.server_path
    }
  }
  await BackupFileModel.addFile({
    file_size,
    file_name,
    file_type,
    file_time,
    client_type,
    origin_path,
    server_path,
    width,
    height,
    file_md5: md5,
    create_time: Date.now()
  })
  await TmpFileModel.updateFile(tmp_file_id, {
    state: TmpFileModel.STATE_OK
  })
  chunks.forEach(chunk => {
    const path = chunk.server_path
    console.log(`Remove chunk file ${path}`)
    FileUtil.delFile(path)
  })
}

module.exports.download = async ctx => {
  const { file_id } = ctx.params
  const file = await BackupFileModel.getFile(file_id, 'server_path')
  if (!file) {
    throw new Error('file not found')
  }
  ctx.attachment(file.server_path)
}

module.exports.getFile = async (file_id, cols = '*') => {
  return await BackupFileModel.getFile(file_id, cols)
}

module.exports.delFile = async file_id => {
  return await BackupFileModel.delFile(file_id)
}

module.exports.getImgList = async (last_id, last_file_time, size = 10) => {
  const file_list = await BackupFileModel.getImgList(last_file_time, 'id,file_size,file_md5,file_name,file_type,file_time,client_type,width,height,create_time', size * 2)
  const res_list = []
  for (let file of file_list) {
    if (file.id === last_id && res_list.length > 0) {
      res_list.splice(0, res_list.length)
      continue
    }
    file.file_url = `/api/v1/h5/file/${file.id}`
    res_list.push(file)
    if (res_list.length === size) {
      break
    }
  }
  if (res_list.length > 0) {
    const { id, file_time } = res_list[res_list.length - 1]
    last_id = id
    last_file_time = file_time
  }
  return {
    last_id,
    last_file_time,
    items: res_list
  }
}
