const fs = require('fs')
const path = require('path')

module.exports = {
  appDirectory: fs.realpathSync(process.cwd()),
  scriptDirectory: path.resolve(__dirname, '..')
}
