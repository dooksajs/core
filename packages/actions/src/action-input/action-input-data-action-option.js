import createAction from '@dooksa/create-action'

export default createAction('action-input-data-action-option', [
  {
    $id: 'option_component',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'option-variable-value',
        isTemplate: true
      }
    }
  },
  {
    $id: 'variable_action_metadata',
    action_getBlockValue: {
      value: { action_getPayloadValue: 'value' },
      query: 'metadata'
    }
  },
  {
    $id: 'add one to index',
    operator_eval: {
      name: '++',
      values: [
        { action_getPayloadValue: 'key' }
      ]
    }
  },
  {
    action_getBlockValue: {
      value: {
        state_getValue: {
          name: 'metadata/actions',
          id: { $ref: 1 }
        }
      },
      query: 'item.title'
    }
  },
  {
    $id: 'variable_action_id',
    action_getBlockValue: {
      value: { action_getPayloadValue: 'value' },
      query: 'id'
    }
  },
  {
    $id: 'option_value',
    operator_eval: {
      name: '+',
      values: [
        { $ref: 2 },
        '. ',
        { $ref: 3 },
        ' [',
        { $ref: 4 },
        ']'
      ]
    }
  },
  {
    $id: 'option_component_id',
    action_getBlockValue: {
      value: { $ref: 0 },
      query: 'id'
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          prefixId: { $ref: 6 },
          id: 'option-text',
          value: { $ref: 5 }
        },
        {
          prefixId: { $ref: 6 },
          id: 'option-value',
          value: { $ref: 4 }
        }
      ]
    }
  },
  {
    state_setValue: {
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
