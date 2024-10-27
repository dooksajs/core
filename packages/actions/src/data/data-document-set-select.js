import createAction from '@dooksa/create-action'

export default createAction('data-document-set-select', [
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [{
        id: 'data-document-collection',
        value: { action_getPayloadValue: 'target.value' }
      }]
    }
  },
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'data-document-select',
        isTemplate: true
      }
    }
  },
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-card-body-label-required',
        isTemplate: true
      }
    }
  },
  {
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'data-document-root-id'
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action-card-body-label-icon',
          value: 'mdi:file-document'
        },
        {
          id: 'action-card-body-label-text',
          value: 'Document ID'
        }
      ]
    }
  },
  {
    data_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          value: { $ref: 2 },
          query: 'id'
        }
      },
      options: {
        id: { $ref: 3 },
        update: {
          method: 'splice',
          startIndex: 2,
          deleteCount: 1
        }
      }
    }
  },
  {
    data_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          value: { $ref: 1 },
          query: 'id'
        }
      },
      options: {
        id: { $ref: 3 },
        update: {
          method: 'splice',
          startIndex: 3,
          deleteCount: 1
        }
      }
    }
  }
])
