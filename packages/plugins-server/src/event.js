import createPlugin from '@dooksa/create-plugin'
import { event } from '@dooksa/plugins'
import { databaseSeed } from './database.js'

export default createPlugin('event', {
  models: { ...event.models },
  setup () {
    databaseSeed('event-listeners')
    databaseSeed('event-handlers')
  }
})
