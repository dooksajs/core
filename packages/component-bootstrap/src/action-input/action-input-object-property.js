import { createText, createDiv, createButton, createCode } from '@dooksa/component-base'
import { createCard, createCardBody, createCardHeader, createIcon } from '@dooksa/component-extra'

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
              actionId: 'action-input-object-property-value'
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
      ]
    })
  ]
})
