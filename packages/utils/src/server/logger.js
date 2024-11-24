import chalk from 'chalk'

/**
 * @param {Object} options
 * @param {'INFO' | 'WARN' | 'ERROR'} [options.level='INFO'] - logging type
 * @param {string} options.message - Main message content
 * @param {string} [options.context] - Additional context
 * @param {DOMHighResTimeStamp} [options.duration] - Execution time in milliseconds
 */
function log ({
  level = 'INFO',
  message,
  context,
  duration = 0
}) {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0')

  let sayMessage = chalk.grey(`${hours}:${minutes}:${seconds}.${milliseconds} `)

  switch (level) {
    case 'WARN':
      sayMessage += chalk.yellowBright('Warning: ') + chalk.yellow(message)
      break

    case 'ERROR':
      sayMessage += chalk.redBright('Error: ') + chalk.red(message)
      break

    default:
      sayMessage += chalk.white('Info: ') + chalk.green(message)
      break
  }

  if (context) {
    sayMessage += ' [' + chalk.yellow(`${context}`) + ']'
  }

  if (duration) {
    sayMessage = sayMessage + ' (' + chalk.blue(Math.floor(duration) + ' ms)')
  }

  console.log(sayMessage)
}

export default log
