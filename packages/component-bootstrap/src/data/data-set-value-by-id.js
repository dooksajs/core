import { createCardBody } from '@dooksa/component-extra'
import {
  createDiv,
  createInputHidden,
  createOption,
  createSelect,
  createText
} from '@dooksa/component-base'
import actionCardBodyLabelRequired from '../action-card/action-card-body-label-required.js'

export default createCardBody({
  metadata: { id: 'data-set-value-by-id' },
  children: [
    createDiv({
      children: [
        createInputHidden({
          options: {
            name: 'action-method'
          },
          events: [
            {
              on: 'component/created',
              actionId: 'action-input-name-prefix'
            },
            {
              on: 'component/created',
              actionId: 'action-input-value-action-method'
            }
          ]
        }),
        actionCardBodyLabelRequired,
        createDiv({
          children: [
            createSelect({
              children: [
                createOption({
                  children: [
                    createText({ options: { value: 'Selection method' } })
                  ],
                  options: {
                    selected: true,
                    value: ''
                  }
                }),
                createOption({
                  children: [
                    createText({ options: { value: 'Document' } })
                  ],
                  options: { value: 'document-by-id' }
                }),
                createOption({
                  children: [
                    createText({ options: { value: 'Context' } })
                  ],
                  options: { value: 'document-by-context' }
                }),
                createOption({
                  children: [
                    createText({ options: { value: 'Action' } })
                  ],
                  options: { value: 'document-by-action' }
                })
              ],
              options: {
                required: true,
                name: 'select-method'
              },
              events: [
                {
                  on: 'component/created',
                  actionId: 'input-id'
                },
                {
                  on: 'component/created',
                  actionId: 'action-input-name-prefix'
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
                strength: '4'
              }
            ]
          }
        })
      ]
    })
  ],
  options: {
    display: [{
      type: 'grid'
    }],
    gapRow: '3'
  },
  events: [
    {
      on: 'component/beforeCreate',
      actionId: 'data-document-select-method-label'
    },
    {
      on: 'component/beforeCreate',
      actionId: 'variable-context-id'
    }
  ]
})
