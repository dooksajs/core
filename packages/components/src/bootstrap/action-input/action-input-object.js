import { createButton, createDiv, createText } from '@dooksa/components/base'
import actionCardBodyLabelTextRequired from '../action-card/action-card-body-label-text-required.js'
import { createIcon } from '@dooksa/components/extra'

export default createDiv({
  metadata: { id: 'action-input-object' },
  children: [
    actionCardBodyLabelTextRequired,
    createDiv({
      children: [
        createDiv({
          options: {
            display: [{
              type: 'grid'
            }],
            gapRow: '3'
          },
          events: [
            {
              on: 'component/created',
              actionId: 'action-input-object-properties'
            }
          ]
        }),
        createDiv({
          children: [
            createButton({
              children: [
                createIcon({
                  options: {
                    icon: 'mdi:tag-plus',
                    margin: [{
                      direction: 'end',
                      strength: '1'
                    }]
                  }
                }),
                createText({
                  options: {
                    value: 'Add property'
                  }
                })
              ],
              options: {
                btnVariant: 'primary'
              },
              events: [
                {
                  on: 'node/click',
                  actionId: 'action-input-add-object-property'
                }
              ]
            })
          ]
        })
      ],
      options: {
        display: [{
          type: 'grid'
        }],
        gapRow: '3',
        margin: [{
          direction: 'start',
          strength: '4'
        }]
      }
    })
  ]
})
