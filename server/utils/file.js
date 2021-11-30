const Crypto = require('crypto')
const FS = require('fs')

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
