import { createText, createDiv, createButton } from '@dooksa/component-base'
import { createCard, createCardBody, createCardHeader, createIcon } from '@dooksa/component-extra'

export default createCard({
  metadata: {
    id: 'action-input-array-item'
  },
  children: [
    createCardHeader({
      children: [
        // item title
        createDiv({
          children: [
            createText({
              options: {
                value: 'Item'
              }
            })
          ]
        }),
        // item navigation
        createDiv({
          children: [
            createButton({
              children: [
                createIcon({
                  options: {
                    icon: 'mdi:chevron-up'
                  }
                })
              ],
              options: {
                btnVariant: 'light',
                btnSize: 'sm',
                rounded: 'circle'
              }
            }),
            createButton({
              children: [
                createIcon({
                  options: {
                    icon: 'mdi:chevron-down'
                  }
                })
              ],
              options: {
                btnVariant: 'light',
                btnSize: 'sm',
                rounded: 'circle'
              }
            }),
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
          actionId: 'action-input-data'
        }
      ]
    })
  ]
})
