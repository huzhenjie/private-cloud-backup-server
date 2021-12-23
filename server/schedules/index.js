const NodeSchedule = require('node-schedule')
const FileService = require('../services/file')
const Util = require('../utils')

module.exports.init = () => {
  NodeSchedule.scheduleJob('0 0/30 * * * *', async () => {
    const dt_str = Util.fmtDatetime(Date.now())
    console.log(`${dt_str} [SCHEDULE] Clear trash job`)
    await FileService.clearTrash()
  })
}


