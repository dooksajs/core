import createAction from '@dooksa/create-action'

export default createAction('select-edit-inner-iterate', [
  { // get component template id
    variable_getValue: {
      name: 'component/items',
      query: {
        id: {
          action_getPayloadValue: 'value'
        }
      }
    }
  },
  { // Replace current component with 'bootstrap-select-edit-link'
    action_ifElse: {
      if: [
        {
          op: '!=',
          from: {
            action_getBlockValue: {
              value: {
                $ref: 0
              },
              query: 'id'
            }
          },
          to: 'select-edit-inner'
        }
      ],
      then: [{ $sequenceRef: 2 }, { $sequenceRef: 3 }, { $sequenceRef: 4 }, { $sequenceRef: 5 }],
      else: [{ $sequenceRef: 6 }]
    }
  },
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'select-edit-inner',
        isTemplate: true
      }
    }
  },
  {
    action_getBlockValue: {
      value: {
        $ref: 2
      },
      query: 'id'
    }
  },
  {
    variable_setValue: {
      scope: {
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
