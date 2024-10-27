import createAction from '@dooksa/create-action'

export default createAction('action-add-block-insert-action', [
  { data_generateId: '$null' },
  // get selected metadata
  {
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      prefixId: { action_getContextValue: 'rootId' },
      query: 'metadata'
    }
  },
  // get action root id
  {
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'component-parent-id'
    }
  },
  // set action metadata in global action list
  {
    variable_setValue: {
      scope: { $ref: 2 },
      values: [
        {
          id: { $ref: 0 },
          value: { $ref: 1 }
        }
      ]
    }
  },
  // store metadata and parent action id to new action block group
  {
    variable_setValue: {
      scope: { $ref: 0 },
      groupId: { $ref: 0 },
      values: [
        {
          id: 'metadata',
          value: { $ref: 1 }
        },
        {
          id: 'component-parent-id',
          value: { $ref: 2 }
        }
      ]
    }
  },
  // create new action card
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-card',
        isTemplate: true,
        groupId: { $ref: 0 }
      }
    }
  },
  // get list of children of parent component
  {
    data_getValue: {
      name: 'component/children',
      id: { $ref: 2 }
    }
  },
  // get the index of current add block component
  {
    list_indexOf: {
      items: {
        action_getBlockValue: {
          value: { $ref: 6 },
          query: 'item'
        }
      },
      value: {
        variable_getValue: {
          scope: { action_getContextValue: 'groupId' },
          query: 'component-id'
        }
      }
    }
  },
  // increment the index to push new action card under add block
  {
    operator_eval: {
      name: '++',
      values: [{ $ref: 7 }]
    }
  },
  // insert action card
  {
    data_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          value: { $ref: 5 },
          query: 'id'
        }
      },
      options: {
        id: { $ref: 2 },
        update: {
          method: 'splice',
          startIndex: { $ref: 8 }
        }
      }
    }
  }
])
