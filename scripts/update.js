const fs = require('fs')
const path = require('path')
const { appDirectory } = require(path.resolve(__dirname, '../utils/paths.js'))
const { execSync } = require('child_process')
const appPath = path.join(appDirectory, 'node_modules', '@dooksa')

if (fs.existsSync(appPath)) {
  try {
    // delete app directory
    fs.rm(appPath, { recursive: true }, (err) => {
      if (err) {
          throw err;
      }

      console.log(`${appPath} is deleted!`);
      console.log('-------------------------');
      console.log('Updating dooksa packages...');

      execSync('npm install', { stdio: 'inherit' })
    })
  } catch (err) {
    console.error(`Error while deleting ${appPath}.`);
  }
}
