import createAction from '@dooksa/create-action'

export const actionInputDataType = createAction('action-input-data-type', [
  // 0. get input type
  {
    $id: 'data_type',
    action_getPayloadValue: 'target.value'
  },
  // 1. get the first component from root children
  {
    data_getValue: {
      name: 'component/children',
      id: { action_getContextValue: 'rootId' },
      options: {
        position: ['0', '1']
      }
    }
  },
  // 2. reset root children
  {
    data_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          value: { $ref: 1 },
          query: 'item'
        }
      },
      options: {
        id: { action_getContextValue: 'rootId' },
        replace: true
      }
    }
  },
  // 3. second column component Id
  {
    action_getBlockValue: {
      value: { $ref: 1 },
      query: 'item.1'
    }
  },
  // 4. append text input
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 0 },
          to: 'text',
          op: '=='
        }
      ],
      then: [{ $sequenceRef: 5 }, { $sequenceRef: 6 }, { $sequenceRef: 7 }],
      else: [{ $sequenceRef: 8 }]
    }
  },
  // 5
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-text-label',
        isTemplate: true
      }
    }
  },
  // 6. add text component
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-text',
        isTemplate: true
      }
    }
  },
  // 7. append text component to current component
  {
    data_setValue: {
      name: 'component/children',
      value: [
        {
          action_getBlockValue: {
            value: { $ref: 5 },
            query: 'id'
          }
        },
        {
          action_getBlockValue: {
            value: { $ref: 6 },
            query: 'id'
          }
        }
      ],
      options: {
        id: { $ref: 3 },
        replace: true
      }
    }
  },
  // 8. add action input
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 0 },
          to: 'action',
          op: '=='
        }
      ],
      then: [{ $sequenceRef: 9 }, { $sequenceRef: 10 }, { $sequenceRef: 11 }],
      else: [{ $sequenceRef: 12 }]
    }
  },
  // 9. add text component
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-action-label',
        isTemplate: true
      }
    }
  },
  // 10. add text component
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-action',
        isTemplate: true
      }
    }
  },
  // 11. append text component to current component
  {
    data_setValue: {
      name: 'component/children',
      value: [
        {
          action_getBlockValue: {
            value: { $ref: 9 },
            query: 'id'
          }
        },
        {
          action_getBlockValue: {
            value: { $ref: 10 },
            query: 'id'
          }
        }
      ],
      options: {
        id: { $ref: 3 },
        replace: true
      }
    }
  },
  // 12. append action query
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 0 },
          to: 'context',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 13 },
        { $sequenceRef: 14 },
        { $sequenceRef: 15 }
      ],
      else: []
    }
  },
  // 13. add text component
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-context-label',
        isTemplate: true
      }
    }
  },
  // 14. add text component
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-context',
        isTemplate: true
      }
    }
  },
  // 15. append text component to current component
  {
    data_setValue: {
      name: 'component/children',
      value: [
        {
          action_getBlockValue: {
            value: { $ref: 13 },
            query: 'id'
          }
        },
        {
          action_getBlockValue: {
            value: { $ref: 14 },
            query: 'id'
          }
        }
      ],
      options: {
        id: { $ref: 3 },
        replace: true
      }
    }
  }
])
