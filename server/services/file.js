const FileModel = require('../models/file')
const TmpFileModel = require('../models/tmp-file')
const TmpFileChunkModel = require('../models/tmp-file-chunk')
const FS = require("fs")
const FileUtil = require("../utils/file")
const Config = require("../../config")

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
  // const file_md5 = await FileUtil.fileMd5(server_path)
}

module.exports.h5Combine = async tmp_file_id => {
  const tmp_file = await TmpFileModel.getFile(tmp_file_id, 'state')
  if (!tmp_file) {
    throw new Error('file apply info not found')
  }
  if (tmp_file.state === TmpFileModel.STATE_OK) {
    return
  }
  const chunks = await TmpFileChunkModel.getChunksByTmpFileId(tmp_file_id, 'offset,chunk_size,server_path,state')
  if (chunks.length === 0) {
    throw new Error('chunks not found')
  }
  chunks.some(chunk => chunk.state !== TmpFileChunkModel.STATE_OK) && throw new Error('chunks not all ok')

}
