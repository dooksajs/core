import { createDiv } from '@dooksa/components/base'
import actionCardBodyLabelTextRequired from '../action-card/action-card-body-label-text-required.js'
import { createCard, createCardBody } from '@dooksa/components/extra'

export default createDiv({
  metadata: { id: 'action-input-string' },
  children: [
    actionCardBodyLabelTextRequired,
    createCard({
      children: [
        createCardBody({
          events: [
            {
              on: 'component/created',
              actionId: 'action-input-string'
            }
          ]
        })
      ],
      options: {
        margin: [{
          direction: 'start',
          strength: '4'
        }]
      }
    })
  ]
})
