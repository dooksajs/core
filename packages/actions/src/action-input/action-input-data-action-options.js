import createAction from '@dooksa/create-action'

export const actionInputDataActionOptions = createAction('action-input-data-action-options', [
  {
    $id: 'action_sequence',
    data_getValue: {
      name: 'component/children',
      id: {
        variable_getValue: {
          query: 'component-parent-id'
        }
      }
    }
  },
  {
    list_map: {
      items: {
        action_getBlockValue: {
          value: { $ref: 'action_sequence' },
          query: 'item'
        }
      },
      actionId: 'action-input-data-action-list'
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action-input-data-list-break',
          value: false
        }
      ]
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: {
            action_getBlockValue: {
              value: { $ref: 1 },
              query: 'length'
            }
          },
          to: 0,
          op: '>'
        }
      ],
      then: [{ $sequenceRef: 4 }],
      else: [{ $sequenceRef: 5 }, { $sequenceRef: 6 }, { $sequenceRef: 7 }, { $sequenceRef: 8 }]
    }
  },
  {
    $id: 'create_options',
    list_map: {
      items: {
        $ref: 1
      },
      actionId: 'action-input-data-action-option'
    }
  },
  {
    $id: 'create_option',
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'option-variable-value',
        isTemplate: true
      }
    }
  },
  {
    action_getBlockValue: {
      value: { $ref: 5 },
      query: 'id'
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'option-text',
          prefixId: { $ref: 6 },
          value: 'No actions'
        },
        {
          id: 'option-value',
          prefixId: { $ref: 6 },
          value: ''
        }
      ]
    }
  },
  {
    $id: 'append_option_to_select',
    data_setValue: {
      name: 'component/children',
      value: { $ref: 6 },
      options: {
        id: {
          action_getContextValue: 'id'
        },
        update: {
          method: 'push'
        }
      }
    }
  }
])
