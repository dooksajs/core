import createAction from '@dooksa/create-action'

export default createAction('action-input-data-object', [
  // {
  //   state_setValue: {
  //     name: 'component/items',
  //     value: {
  //       id: 'action-input-data-string',
  //       isTemplate: true
  //     }
  //   }
  // },
  // {
  //   variable_setValue: {
  //     scope: {
  //       action_getContextValue: 'groupId'
  //     },
  //     values: [
  //       {
  //         id: 'action-input-name',
  //         value: 'value'
  //       },
  //       {
  //         id: 'action-input-value',
  //         value: { $ref: 3 }
  //       }
  //     ]
  //   }
  // },
  // {
  //   state_setValue: {
  //     name: 'component/children',
  //     value: {
  //       action_getValue: {
  //         value: { $ref: 3 },
  //         query: 'id'
  //       }
  //     },
  //     options: {
  //       id: {
  //         action_getContextValue: 'parentId'
  //       },
  //       update: {
  //         method: 'splice',
  //         startIndex: 1,
  //         deleteCount: 1
  //       }
  //     }
  //   }
  // }
])
