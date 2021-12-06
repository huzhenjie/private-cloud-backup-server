const Crypto = require('crypto')
const FS = require('fs')
const Config = require("../../config")
const Util = require("../utils/index")

module.exports.fileMd5 = filePath => {
  return new Promise((resolve, reject) => {
    const hash = Crypto.createHash('md5')
    const stream = FS.createReadStream(filePath)
    stream.on('data', data => {
      hash.update(data)
    })
    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })
    stream.on('error', err => {
      reject(err)
    })
  })
}

module.exports.fileMd5ByStream = stream => {
  return new Promise((resolve, reject) => {
    const hash = Crypto.createHash('md5')
    stream.on('data', data => {
      hash.update(data)
    })
    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })
    stream.on('error', err => {
      reject(err)
    })
  })
}

module.exports.combineFile = (target_path, source_paths) => {
  return new Promise((resolve, reject) => {
    const writer = FS.createWriteStream(target_path)
    mergeStream(writer, source_paths, resolve, reject)
  })
}

function mergeStream(writer, source_paths, resolve, reject) {
  if (source_paths.length === 0) {
    resolve()
    return
  }
  const reader = FS.createReadStream(source_paths.shift())
  reader.pipe(writer, { end: false })
  reader.on('end', () => {
    mergeStream(writer, source_paths, resolve, reject)
  })
  reader.on('error', err => {
    reject(err)
  })
}

module.exports.mkdir = dir_path => {
  if (FS.existsSync(dir_path)) {
    return
  }
  FS.mkdirSync(dir_path, { recursive: true })
}

module.exports.fileSize = path => {
  if (FS.existsSync(path)) {
    return FS.statSync(path).size
  }
  console.error('fileSize: file not exist')
  return 0
}

module.exports.delFile = path => {
  if (FS.existsSync(path)) {
    FS.unlinkSync(path)
  }
}

module.exports.getAbsServerPath = (dir, file_name) => {
  module.exports.mkdir(dir)
  let path = dir + file_name
  if (!FS.existsSync(path)) {
    return path
  }
  const index = file_name.lastIndexOf('.')
  let name = file_name
  let ext = ''
  if (index > -1) {
    ext = file_name.substring(index) // .jpg if file_name.jpg
    name = file_name.substring(0, index) // file_name if file_name.jpg
  }
  let i = 0
  while (true) {
    path = dir + name + '_' + i + ext
    if (FS.existsSync(path)) {
      i++
    } else {
      return path
    }
  }
}
