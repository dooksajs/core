import createAction from '@dooksa/create-action'

export default createAction('action-input-array-items', [
  {
    $id: 'data_item',
    variable_getValue: {
      query: 'action-input-value'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          left: { $ref: 'data_item' },
          op: '!!'
        }
      ],
      then: [
        { $sequenceRef: 'data_item_list' }
      ],
      else: [
        { $sequenceRef: 'schema' },
        { $sequenceRef: 'ifElse_schema' }
      ]
    }
  },
  {
    $id: 'data_item_list',
    list_map: {
      items: { $ref: 'data_item' },
      actionId: 'action-input-array-item'
    }
  },
  {
    $id: 'schema',
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'action-input-schema'
    }
  },
  {
    $id: 'ifElse_schema',
    action_ifElse: {
      if: [
        {
          left: { $ref: 'schema' },
          op: '!!'
        }
      ],
      then: [
        { $sequenceRef: 'schema_list' }
      ],
      else: []
    }
  },
  {
    $id: 'schema_list',
    list_map: {
      items: { $ref: 'schema' },
      actionId: 'action-input-array-item'
    }
  }
])
