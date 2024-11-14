import { createDiv } from '@dooksa/component-base'
import actionCardBodyLabelTextRequired from '../action-card/action-card-body-label-text-required.js'

export default createDiv({
  metadata: { id: 'data-document-value-object' },
  children: [
    actionCardBodyLabelTextRequired,
    createDiv({
      options: {
        margin: [{
          direction: 'start',
          strength: '4'
        }]
      },
      events: [
        {
          on: 'component/created',
          actionId: 'data-document-value-object'
        }
      ]
    })
  ]
})
