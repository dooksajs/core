import createAction from '@dooksa/create-action'

export const actionAddBlockInsertAction = createAction('action-add-block-insert-action', [
  {
    $id: 'new_group_id',
    state_generateId: '$null'
  },
  // get selected metadata
  {
    $id: 'action_metadata',
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      prefixId: { action_getContextValue: 'rootId' },
      query: 'metadata'
    }
  },
  // get action root id
  {
    $id: 'component_parent_id',
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'component-parent-id'
    }
  },
  // store metadata and parent action id to new action block group
  {
    variable_setValue: {
      scope: { $ref: 'new_group_id' },
      values: [
        {
          id: 'metadata',
          value: { $ref: 'action_metadata' }
        }
      ]
    }
  },
  // create new action card
  {
    $id: 'action_card',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'action-card',
        isTemplate: true,
        groupId: { $ref: 'new_group_id' }
      }
    }
  },
  {
    $id: 'action_card_id',
    action_getBlockValue: {
      value: { $ref: 'action_card' },
      query: 'id'
    }
  },
  // set action metadata in global action list
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'metadata',
          prefixId: { $ref: 'action_card_id' },
          value: { $ref: 'action_metadata' }
        }
      ]
    }
  },
  {
    variable_setValue: {
      scope: { $ref: 'new_group_id' },
      values: [
        {
          id: 'action-card-id',
          value: { $ref: 'action_card_id' }
        }
      ]
    }
  },
  // get list of children of parent component
  {
    $id: 'component_parent',
    state_getValue: {
      name: 'component/children',
      id: { $ref: 'component_parent_id' }
    }
  },
  // get the index of current add block component
  {
    $id: 'component_index',
    list_indexOf: {
      items: {
        action_getBlockValue: {
          value: { $ref: 'component_parent' },
          query: 'item'
        }
      },
      value: {
        variable_getValue: {
          query: 'component-id'
        }
      }
    }
  },
  // increment the index to push new action card under add block
  {
    $id: 'new_component_index',
    operator_eval: {
      name: '++',
      values: [{ $ref: 'component_index' }]
    }
  },
  // insert action card
  {
    state_setValue: {
      name: 'component/children',
      value: { $ref: 'action_card_id' },
      options: {
        id: { $ref: 'component_parent_id' },
        update: {
          method: 'splice',
          startIndex: { $ref: 'new_component_index' }
        }
      }
    }
  }
])
