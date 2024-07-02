import createPlugin from '@dooksa/create-plugin'
import { event } from '@dooksa/plugins'
import { $seedDatabase } from './database.js'

export default createPlugin('event', {
  models: { ...event.models },
  setup () {
    $seedDatabase('event-listeners')
    $seedDatabase('event-handlers')
  }
})
