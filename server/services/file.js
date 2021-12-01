const FS = require("fs")
const Config = require("../../config")
const FileModel = require('../models/file')
const TmpFileModel = require('../models/tmp-file')
const TmpFileChunkModel = require('../models/tmp-file-chunk')
const FileUtil = require("../utils/file")
const Util = require('../utils/index')

module.exports.h5UploadApply = async file_info_list => {
  return await Promise.all(file_info_list.map(async ({ file_name, file_type, file_size, file_time }) => {
    const exist_file_cnt = await FileModel.getFileCntByFilter({file_name, file_type })
    const create_time = Date.now()
    const tmp_file_id = await TmpFileModel.addFile({
      file_size,
      file_name,
      file_type,
      file_time,
      create_time,
      client_type: FileModel.CLIENT_TYPE_H5
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
        upload_url: `/api/v1/file/h5/upload/${tmp_file_id}/${offset}`
      })
      offset += Config.file.chunk_size
    }
    return {
      file_name,
      file_type,
      exist_file_cnt,
      chunks,
      id: tmp_file_id
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
    'state,file_name,file_size,file_md5,file_type,file_time,client_type,origin_path'
  )
  if (!tmp_file) {
    throw new Error('file apply info not found')
  }
  const { state, file_name, file_size, file_md5, file_type, file_time, client_type, origin_path } = tmp_file
  // if (state === TmpFileModel.STATE_OK) {
  //   console.log('file already combine')
  //   return
  // }
  const chunks = await TmpFileChunkModel.getChunksByTmpFileId(tmp_file_id, 'offset,chunk_size,server_path,state')
  if (chunks.length === 0) {
    throw new Error('chunks not found')
  }
  const chunk_not_all_ok = chunks.some(chunk => chunk.state !== TmpFileChunkModel.STATE_OK)
  if (chunk_not_all_ok) {
    throw new Error('chunks not all ok')
  }
  const server_path = getAbsServerPath(file_name)
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
  await FileModel.addFile({
    file_size,
    file_name,
    file_type,
    file_time,
    client_type,
    origin_path,
    server_path,
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
  const file = await FileModel.getFile(file_id, 'server_path')
  if (!file) {
    throw new Error('file not found')
  }
  ctx.attachment(file.server_path)
}

module.exports.getFile = async (file_id, cols = '*') => {
  return await FileModel.getFile(file_id, cols)
}

function getAbsServerPath(file_name) {
  const dir = Config.path.source_path + 'file/' + Util.fmtDatetime(Date.now(), 'yyyyMMdd') + '/'
  FileUtil.mkdir(dir)
  const index = file_name.lastIndexOf('.')
  let name = file_name
  let ext = ''
  if (index > -1) {
    ext = file_name.substring(index) // .jpg if file_name.jpg
    name = file_name.substring(0, index) // file_name if file_name.jpg
  }
  let i = 0
  while (true) {
    const target_file_name = i === 0 ? file_name : name + '_' + i + ext
    const path = dir + target_file_name
    if (FS.existsSync(path)) {
      i++
    } else {
      return path
    }
  }
}
