const FS = require('fs')
const Path = require("path")

const config = {
  port: 5233,
  database: {
    HOST: 'localhost',
    PORT: '3306',
    USERNAME: 'root',
    PASSWORD: '',
    DATABASE: 'private_cloud'
  },
  redis: {
    PORT: 6379,
    HOST: '127.0.0.1',
    PASSWORD: '3y3IQezN',
    PREFIX: 'PC'
  },
  file: {
    chunk_size: 1024 * 1024,
    trash_time: 3600000 * 24 * 7
  },
  path: {
    source_path: Path.join(__dirname, './static/')
  }
}

module.exports = config
