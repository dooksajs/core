import createAction from '@dooksa/create-action'

export default createAction('on-create-accordion', [
  {
    set_dataValue: {
      name: 'component/items',
      value: {
        id: 'accordion-item',
        isTemplate: true
      }
    }
  },
  {
    set_dataValue: {
      name: 'component/items',
      value: {
        id: 'accordion-item',
        isTemplate: true
      }
    }
  },
  {
    set_dataValue: {
      name: 'component/children',
      value: [
        {
          get_blockValue: {
            value: {
              get_sequenceValue: '0'
            },
            query: 'id'
          }
        },
        {
          get_blockValue: {
            value: {
              get_sequenceValue: '1'
            },
            query: 'id'
          }
        }
      ],
      options: {
        id: {
          get_contextValue: 'id'
        },
        update: {
          method: 'push'
        }
      }
    }
  }
])
