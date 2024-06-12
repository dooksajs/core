import createAction from '@dooksa/create-action'

export default createAction('edit-section-inner', [
  {
    get_dataValue: {
      name: 'component/children',
      query: {
        id: {
          get_contextValue: 'id'
        }
      }
    }
  },
  {
    eval_condition: {
      if: [{
        op: '>',
        from: {
          get_blockValue: {
            value: {
              get_sequenceValue: '0'
            },
            query: 'length'
          }
        },
        to: 0
      }],
      then: [2, 3],
      else: []
    }
  },
  {
    list_forEach: {
      async: true,
      items: {
        get_sequenceValue: '0'
      },
      context: {
        get_contextValue: '$null'
      },
      actionId: 'edit-section-inner-iterate'
    }
  },
  {
    set_dataValue: {
      name: 'component/children',
      value: {
        get_sequenceValue: '2'
      },
      options: {
        id: {
          get_contextValue: 'id'
        }
      }
    }
  }
], ['edit-section-inner-iterate'])
