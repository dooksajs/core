import { createDiv } from '@dooksa/components/base'
import actionCardBodyLabelTextRequired from '../action-card/action-card-body-label-text-required.js'
import actionInputDataString from '../action-input/action-input-data-string.js'

export default createDiv({
  metadata: { id: 'data-document-value-text' },
  children: [
    actionCardBodyLabelTextRequired,
    createDiv({
      children: [
        actionInputDataString
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
