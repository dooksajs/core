/**
 * Ds Plugin.
 * @module plugin
 */
export default {
  name: 'dsTemplate',
  version: 1,
  dependencies: [
    {
      name: 'dsUtilities',
      version: 1
    }
  ],
  data: {
    layouts: {
      items: {
        _lkZxHJt5396RqwdoTsDZIA: [
          {
            componentId: '_BeXjbYmkMy1VtUPqzwfj$w',
            children: [
              1,
              2
            ]
          },
          {
            componentId: '_cnX0yB7KMVbJCFFwn6YpUg',
            contentIndex: 0,
            parentIndex: 0
          },
          {
            componentId: '_I3nFFU2lp3zO6WNiH7nqig',
            parentIndex: 0,
            children: [
              3
            ]
          },
          {
            componentId: '_T_q0GfGkVNpnUi1yNYR3AA',
            parentIndex: 2,
            children: [
              4,
              5
            ]
          },
          {
            componentId: '_XJhwwfkzUwUeE6BICl0aFg',
            contentIndex: 1,
            parentIndex: 3
          },
          {
            componentId: '_8HJ4uKrZrGn1qsccXSGz6w',
            contentIndex: 2,
            parentIndex: 3
          }
        ],
        _ZWblGOXRUg7MtMj_3y5AsA: [
          {
            componentId: '_vR3xEqs0YL6wZPJmaAaFQQ',
            children: [
              1,
              3
            ]
          },
          {
            componentId: '_ZlvZCj2Y6E8HBJNtHIaBbg',
            parentIndex: 0,
            children: [
              2
            ]
          },
          {
            componentId: '_8HJ4uKrZrGn1qsccXSGz6w',
            contentIndex: 0,
            parentIndex: 1
          },
          {
            componentId: '_UL2qChLSgNhi0dQe8bs9fg',
            parentIndex: 0
          }
        ],
        _Snun0s17myLfk0li2$d4kg: [
          {
            componentId: '_vR3xEqs0YL6wZPJmaAaFQQ',
            children: [
              1,
              3,
              4
            ]
          },
          {
            componentId: '_ZlvZCj2Y6E8HBJNtHIaBbg',
            parentIndex: 0,
            children: [
              2
            ]
          },
          {
            componentId: '_8HJ4uKrZrGn1qsccXSGz6w',
            contentIndex: 0,
            parentIndex: 1
          },
          {
            componentId: '_VEsnQn6Xll_$pGg1DP$bcg',
            parentIndex: 0
          },
          {
            componentId: '_t_2qqp6pFJ7iKK2GY58Rvw',
            parentIndex: 0,
            children: [
              5
            ]
          },
          {
            componentId: '_8HJ4uKrZrGn1qsccXSGz6w',
            contentIndex: 1,
            parentIndex: 4
          }
        ],
        _0_PUfZuhCpysOxpA3$F0_Q: [
          {
            componentId: '_SqJi7Zlj3IFLNwFnhjT_nA',
            children: [
              1
            ]
          },
          {
            componentId: '_s12tgvH0BXuFzsTKsuC9ww',
            parentIndex: 0,
            children: [
              2
            ]
          },
          {
            componentId: '_54n1erQkwshRmYtjev_ZXA',
            parentIndex: 1,
            children: [
              3,
              7,
              8
            ]
          },
          {
            componentId: '_qWcg0CBVGQfmcLJOYDYogQ',
            parentIndex: 2,
            children: [
              4,
              6
            ]
          },
          {
            componentId: '_paVOPxxelu5q_gjYbceerA',
            parentIndex: 3,
            children: [
              5
            ]
          },
          {
            componentId: '_8HJ4uKrZrGn1qsccXSGz6w',
            contentIndex: 0,
            parentIndex: 4
          },
          {
            componentId: '_FqSntOaoOGKqgPoa4ItHsw',
            parentIndex: 3
          },
          {
            componentId: '_u9JKshx5_v9KPcqasgSYAg',
            contentIndex: 1,
            parentIndex: 2
          },
          {
            componentId: '_Vh7cesCq$Xy1M12M0xINQg',
            parentIndex: 2,
            children: [
              9,
              11
            ]
          },
          {
            componentId: '_7Wp5i7VtMOGpOfNfx0Vtfg',
            parentIndex: 8,
            children: [
              10
            ]
          },
          {
            componentId: '_8HJ4uKrZrGn1qsccXSGz6w',
            contentIndex: 2,
            parentIndex: 9
          },
          {
            componentId: '_ejm07ZxbBmS4lFsTyWOCMQ',
            parentIndex: 8,
            children: [
              12
            ]
          },
          {
            componentId: '_8HJ4uKrZrGn1qsccXSGz6w',
            contentIndex: 3,
            parentIndex: 11
          }
        ],
        _pGnM6uhx3T6KQMKvcjX6YQ: [
          {
            componentId: '_P7Xk1jJvsGoG2RhqGCCljQ',
            contentIndex: 0
          }
        ]
      },
      head: {}
    },
    components: {
      _P7Xk1jJvsGoG2RhqGCCljQ: ['dsDiv', {
        className: 'container'
      }],
      _BeXjbYmkMy1VtUPqzwfj$w: ['dsDiv', {
        className: 'position-relative'
      }],
      _cnX0yB7KMVbJCFFwn6YpUg: ['dsImg'],
      _I3nFFU2lp3zO6WNiH7nqig: ['dsDiv', {
        className: 'bottom-0 p-3 position-absolute start-0'
      }],
      _T_q0GfGkVNpnUi1yNYR3AA: ['dsButton', {
        className: 'btn btn-light shadow-sm'
      }],
      _XJhwwfkzUwUeE6BICl0aFg: ['dsI', {
        className: 'dsi-image dsi-solid me-1'
      }],
      _8HJ4uKrZrGn1qsccXSGz6w: ['dsText'],
      _SqJi7Zlj3IFLNwFnhjT_nA: ['dsDiv', {
        className: 'modal',
        tabindex: '-1'
      }],
      _s12tgvH0BXuFzsTKsuC9ww: ['dsDiv', {
        className: 'modal-dialog shadow-lg'
      }],
      _54n1erQkwshRmYtjev_ZXA: ['dsDiv', {
        className: 'modal-content'
      }],
      _qWcg0CBVGQfmcLJOYDYogQ: ['dsDiv', {
        className: 'bg-light modal-header'
      }],
      _paVOPxxelu5q_gjYbceerA: ['dsH5', {
        className: 'modal-title'
      }],
      _FqSntOaoOGKqgPoa4ItHsw: ['dsButton', {
        type: 'button',
        className: 'btn-close'
      }],
      _u9JKshx5_v9KPcqasgSYAg: ['dsDiv', {
        className: 'modal-body'
      }],
      _vR3xEqs0YL6wZPJmaAaFQQ: ['dsDiv', {
        className: 'mb-3'
      }],
      _ZlvZCj2Y6E8HBJNtHIaBbg: ['dsLabel', {
        className: 'form-label'
      }],
      _UL2qChLSgNhi0dQe8bs9fg: ['dsInput', {
        className: 'form-control',
        type: 'file'
      }],
      _VEsnQn6Xll_$pGg1DP$bcg: ['dsInput', {
        className: 'form-control',
        value: 'fill murray'
      }],
      _t_2qqp6pFJ7iKK2GY58Rvw: ['dsDiv', {
        className: 'form-text'
      }],
      _Vh7cesCq$Xy1M12M0xINQg: ['dsDiv', {
        className: 'modal-footer'
      }],
      _7Wp5i7VtMOGpOfNfx0Vtfg: ['dsButton', {
        type: 'button',
        className: 'btn btn-outline-secondary'
      }],
      _ejm07ZxbBmS4lFsTyWOCMQ: ['dsButton', {
        type: 'button',
        className: 'btn btn-primary'
      }]
    },
    widgets: {
      _rvMd83GSZuYVdwgUxRYWvK: {
        items: ['_lkZxHJt5396RqwdoTsDZIA', '_0_PUfZuhCpysOxpA3$F0_Q'],
        elements: [
          {
            value: [
              { default: 'https://www.fillmurray.com/640/360' },
              { default: ['dsi-solid', 'dsi-image'] },
              { default: ' Change image' }
            ],
            type: [
              ['image', true], ['icon', false], ['text', false]
            ]
          },
          {
            value: [
              { default: 'Edit image' },
              [['default', '_4vVaXkmAR9qa3b7GFSPOXG']],
              { default: 'Cancel' },
              { default: 'Apply' }
            ],
            type: [
              ['text', false], ['section', false], ['text', false], ['text', false]
            ]
          }
        ]
      },
      _4vVaXkmAR9qa3b7GFSPOXG: {
        items: ['_ZWblGOXRUg7MtMj_3y5AsA', '_Snun0s17myLfk0li2$d4kg'],
        elements: [
          {
            value: [
              { default: 'Image' }
            ],
            type: [
              ['text', false]
            ]
          },
          {
            value: [
              { default: 'Alt text' },
              { default: 'Alt text describes your image for visitors with visual impairments.' }
            ],
            type: [
              ['text', false], ['text', false]
            ]
          }
        ]
      },
      _lDZKiYj73WWRlL3RVyeMO8: {
        items: ['_H2e4SzLZHVwebhHxkUbSlw'],
        elements: [
          {
            value: [
              [['default', '_rvMd83GSZuYVdwgUxRYWvK']]
            ],
            type: [
              ['section', false]
            ]
          }
        ]
      }
    }
  },
  setup () {
    this.$method('dsLayout/setItems', this.layouts.items)
    this.$method('dsComponent/set', this.components)
  },
  methods: {
    create (context, {
      id,
      sectionId = this.$method('dsUtilities/generateId'),
      instanceId,
      groupId = this.$method('dsUtilities/generateId'),
      defaultContent,
      modifiers = {},
      view = 'default',
      head = false
    }) {
      const template = this.widgets[id]
      const item = {
        widgets: {
          items: {},
          content: {},
          layout: {}
        },
        elements: {
          value: {},
          type: {}
        }
      }

      if (head) {
        const layoutId = template.items[0]
        const layout = {}
        const itemId = sectionId + instanceId + '_' + view
        const [content, elements] = this._createElements(template.elements[0], view, groupId, defaultContent, modifiers)
        const modifierId = id + layoutId

        if (modifiers[modifierId]) {
          item.widgets.layout[itemId] = modifiers[modifierId]
        }

        item.widgets.content[itemId] = content
        item.elements = elements
        layout[view] = { id: layoutId }

        this.$method('dsWidget/setLoaded', { id: itemId, value: true })
      } else {
        for (let i = 0; i < template.items.length; i++) {
          const layoutId = template.items[i]
          const layout = {}
          const instanceId = this.$method('dsUtilities/generateId')
          const itemId = sectionId + instanceId + '_default'
          const [content, elements] = this._createElements(template.elements[i], view, groupId, defaultContent, modifiers)
          const modifierId = id + layoutId

          if (modifiers[modifierId]) {
            item.widgets.layout[sectionId + instanceId + '_default'] = modifiers[modifierId]
          }

          item.widgets.content[itemId] = content
          item.elements.value = { ...item.elements.value, ...elements.value }
          item.elements.type = { ...item.elements.type, ...elements.type }

          layout.default = { id: layoutId }

          if (!item.widgets.items[sectionId]) {
            item.widgets.items[sectionId] = [{ groupId, instanceId, layout }]
          } else {
            item.widgets.items[sectionId].push({ groupId, instanceId, layout })
          }

          this.$method('dsWidget/setLoaded', { id: itemId, value: true })
        }
      }

      // Set element content
      if (item.elements) {
        if (item.elements.value) {
          this.$method('dsElement/setValues', item.elements.value)
        }

        if (item.elements.type) {
          this.$method('dsElement/setTypes', item.elements.type)
        }
      }
      // Set widgets
      if (item.widgets) {
        if (item.widgets.items) {
          this.$method('dsWidget/setItems', item.widgets.items)
        }

        if (item.widgets.layout) {
          this.$method('dsWidget/setLayout', item.widgets.layout)
        }

        if (item.widgets.content) {
          const id = this.$method('dsRouter/getCurrentId')

          this.$method('dsWidget/setContent', { id, items: item.widgets.content })
        }
      }

      return [sectionId, item]
    },
    set (context, item) {
      this.widgets = { ...this.widgets, ...item }
    },
    _createElements (items, view, groupId, defaultContent = [], modifiers) {
      const elements = {
        value: {},
        type: {}
      }
      const content = []
      const values = items.value
      const types = items.type

      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        const [type, permanent] = types[i]
        let id = this.$method('dsUtilities/generateId')
        let exists = false

        if (defaultContent.length && permanent) {
          for (let i = 0; i < defaultContent.length; i++) {
            const contentId = defaultContent[i]
            const contentType = this.$method('dsElement/getType', contentId)

            if (type === contentType[0]) {
              id = contentId
              defaultContent.splice(i, 1)
              exists = true
              break
            }
          }
        }

        content.push(id)

        if (!exists) {
          elements.type[id] = [type, permanent]

          if (type === 'section') {
            const elementValue = {}

            for (let i = 0; i < value.length; i++) {
              const [lang, templateId] = value[i]
              const [sectionId] = this.create({}, { id: templateId, defaultContent, groupId, view, modifiers, lang })

              elementValue[lang] = sectionId
            }

            elements.value[id] = elementValue
          } else {
            elements.value[id] = value
          }
        }
      }

      return [content, elements, defaultContent]
    }
  }
}
