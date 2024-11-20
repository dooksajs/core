import { createText, createDiv, createButton, createCode } from '@dooksa/components/base'
import { createCard, createCardBody, createCardHeader, createIcon } from '@dooksa/components/extra'

export default createCard({
  metadata: {
    id: 'action-input-object-property'
  },
  children: [
    createCardHeader({
      children: [
        createDiv({
          children: [
            createText({
              options: {
                value: 'Property ['
              }
            }),
            createCode({
              children: [
                createText({
                  events: [
                    {
                      on: 'component/created',
                      actionId: 'action-input-update-key'
                    }
                  ]
                })
              ]
            }),
            createText({
              options: {
                value: ']'
              }
            })
          ]
        }),
        createDiv({
          children: [
            createButton({
              children: [
                createIcon({
                  options: {
                    icon: 'mdi:close'
                  }
                })
              ],
              options: {
                btnVariant: 'light',
                btnSize: 'sm',
                rounded: 'circle'
              }
            })
          ],
          options: {
            margin: [{
              direction: 'start',
              strength: 'auto'
            }]
          }
        })
      ],
      options: {
        display: [{
          type: 'flex'
        }],
        alignItems: [{
          position: 'center'
        }]
      }
    }),
    createCardBody({
      options: {
        display: [{
          type: 'grid'
        }],
        gapRow: '3'
      },
      events: [
        {
          on: 'component/created',
          actionId: 'action-input-object-property-value'
        }
      ]
    })
  ]
})
