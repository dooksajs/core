import { createPlugin } from '@dooksa/create'
import { event } from '@dooksa/plugins'
import { $seedDatabase } from './database.js'

export default createPlugin({
  name: 'event',
  models: { ...event.models },
  setup () {
    $seedDatabase('event-listeners')
    $seedDatabase('event-handlers')
  }
})
