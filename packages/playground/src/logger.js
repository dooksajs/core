import chalk from 'chalk'

function log (message, timer = 0) {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0')

  message =
    chalk.grey(`${hours}:${minutes}:${seconds}.${milliseconds} `) +
    chalk.white('Info: ') +
    chalk.green(message)

  if (timer) {
    message = message + ' ' + chalk.blue(Math.floor(timer) + ' ms')
  }

  console.log(message)
}

export default log
