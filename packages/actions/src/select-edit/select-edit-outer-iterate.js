import createAction from '@dooksa/create-action'

export default createAction('select-edit-outer-iterate', [
  { // get component template id
    action_getDataValue: {
      name: 'component/items',
      id: {
        action_getPayloadValue: 'value'
      }
    }
  },
  { // Replace current component with 'bootstrap-select-edit-link'
    action_ifElse: {
      if: [
        {
          op: '!=',
          from: {
            action_getValue: {
              value: {
                $ref: 0
              },
              query: 'id'
            }
          },
          to: 'select-edit-outer'
        }
      ],
      then: [{ $sequenceRef: 2 }, { $sequenceRef: 3 }, { $sequenceRef: 4 }, { $sequenceRef: 5 }],
      else: [{ $sequenceRef: 6 }]
    }
  },
  {
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'select-edit-outer',
        isTemplate: true
      }
    }
  },
  {
    action_getValue: {
      value: {
        $ref: 2
      },
      query: 'id'
    }
  },
  {
    variable_setValue: {
      id: {
        $ref: 3
      },
      values: [
        {
          id: 'componentId',
          value: {
            action_getPayloadValue: 'value'
          }
        }
      ]
    }
  },
  { // Add edit section link to parent list
    list_push: {
      target: {
        action_getContextValue: '$list'
      },
      source: {
        $ref: 3
      }
    }
  },
  { // Add edit section link to parent list
    list_push: {
      target: {
        action_getContextValue: '$list'
      },
      source: {
        action_getPayloadValue: 'value'
      }
    }
  }
])
