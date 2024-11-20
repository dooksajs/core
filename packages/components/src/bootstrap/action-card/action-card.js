import { createCard } from '@dooksa/components/extra'
import actionCardHeader from './action-card-header.js'

export default createCard({
  metadata: { id: 'action-card' },
  children: [actionCardHeader],
  options: {
    overflow: 'hidden',
    shadow: 'sm'
  },
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-body'
    }
  ]
})
