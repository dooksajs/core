import { createPlugin, mapSchema } from '@dooksa/create-plugin'
import { event as eventClient } from '../client/index.js'
import { databaseSeed } from './database.js'

export const event = createPlugin('event', {
  schema: { ...mapSchema(eventClient) },
  setup () {
    databaseSeed('event-listeners')
    databaseSeed('event-handlers')
  }
})

export default event
