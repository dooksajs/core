import createAction from '@dooksa/create-action'

export const actionInputDataObject = createAction('action-input-data-object', [
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-string',
        isTemplate: true
      }
    }
  },
  {
    variable_setValue: {
      scope: {
        action_getContextValue: 'groupId'
      },
      values: [
        {
          id: 'action-input-name',
          value: 'value'
        },
        {
          id: 'action-input-value',
          value: { $ref: 3 }
        }
      ]
    }
  },
  {
    data_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          value: { $ref: 3 },
          query: 'id'
        }
      },
      options: {
        id: {
          action_getContextValue: 'parentId'
        },
        update: {
          method: 'splice',
          startIndex: 1,
          deleteCount: 1
        }
      }
    }
  }
])
