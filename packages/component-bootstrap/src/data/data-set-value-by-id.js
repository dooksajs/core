import { extendCardBody } from '@dooksa/component-extra'
import {
  extendDiv, extendOption, extendSelect, extendText
} from '@dooksa/component-base'
import actionCardBodyLabelRequired from '../action-card/action-card-body-label-required.js'

const dataSelectorDiv = extendDiv({
  children: [
    extendSelect({
      children: [
        extendOption({
          children: [
            extendText({ options: { text: 'Select selection method' } })
          ],
          options: {
            selected: true,
            value: ''
          }
        }),
        extendOption({
          children: [
            extendText({ options: { text: 'Select list' } })
          ],
          options: { value: 'document-by-id' }
        }),
        extendOption({
          children: [
            extendText({ options: { text: 'Context value' } })
          ],
          options: { value: 'document-by-context' }
        }),
        extendOption({
          children: [
            extendText({ options: { text: 'Action result' } })
          ],
          options: { value: 'document-by-action' }
        })
      ],
      options: { required: true },
      events: [
        {
          on: 'component/created',
          actionId: 'input-id'
        },
        {
          on: 'node/input',
          actionId: 'data-set-value-by-id-update-fieldset'
        }
      ]
    })
  ],
  options: {
    margin: [
      {
        direction: 'start',
        strength: '3'
      },
      {
        direction: 'bottom',
        strength: '3'
      }
    ]
  }
})

export default extendCardBody({
  metadata: { id: 'data-set-value-by-id' },
  children: [
    actionCardBodyLabelRequired,
    dataSelectorDiv
  ],
  events: [
    {
      on: 'component/beforeCreate',
      actionId: 'data-document-select-method-label'
    },
    {
      on: 'component/beforeCreate',
      actionId: 'data-document-root-id'
    }
  ]
})
