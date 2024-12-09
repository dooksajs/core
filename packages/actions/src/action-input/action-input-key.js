import createAction from '@dooksa/create-action'

export default createAction('action-input-key', [
  {
    $id: 'key',
    variable_getValue: {
      query: 'action-input-key'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 'key' },
          op: 'notNull'
        }
      ],
      then: [{ $sequenceRef: 'update_component_option' }],
      else: []
    }
  },
  {
    $id: 'update_component_option',
    state_setValue: {
      name: 'component/options',
      value: {
        value: { $ref: 'key' }
      },
      options: {
        id: { action_getContextValue: 'id' },
        merge: true
      }
    }
  }
])
