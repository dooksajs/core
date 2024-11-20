import { createDiv } from '@dooksa/components/base'
import actionCardBodyLabelTextRequired from '../action-card/action-card-body-label-text-required.js'

export default createDiv({
  metadata: { id: 'action-input-array-items' },
  children: [
    actionCardBodyLabelTextRequired,
    createDiv({
      options: {
        display: [{
          type: 'grid'
        }],
        gapRow: '3',
        margin: [{
          direction: 'start',
          strength: '4'
        }]
      },
      events: [
        {
          on: 'component/created',
          actionId: 'action-input-array-items'
        }
      ]
    })
  ]
})
