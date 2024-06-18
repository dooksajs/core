import createAction from '@dooksa/create-action'

export default createAction('edit-img', [
  { // get content id
    get_dataValue: {
      name: 'component/content',
      query: {
        id: {
          get_contextValue: 'id'
        }
      }
    }
  },
  { // set image component
    set_dataValue: {
      name: 'component/items',
      value: {
        id: 'img',
        isTemplate: true,
        isTemporary: true
      }
    }
  },
  { // component id
    get_blockValue: {
      value: {
        get_sequenceValue: '1'
      },
      query: 'id'
    }
  },
  { // add image
    set_dataValue: {
      name: 'component/children',
      value: {
        get_sequenceValue: '2'
      },
      options: {
        id: {
          get_contextValue: 'parentId'
        },
        update: {
          method: 'push'
        }
      }
    }
  },
  { // update image content
    set_dataValue: {
      name: 'content/items',
      value: {
        get_dataValue: {
          name: 'content/items',
          query: {
            id: {
              get_sequenceValue: '0'
            }
          }
        }
      },
      options: {
        id: {
          get_dataValue: {
            name: 'component/content',
            query: {
              id: {
                get_sequenceValue: '2'
              }
            }
          }
        }
      }
    }
  },
  {
    set_dataValue: {
      name: 'component/items',
      value: {
        id: 'input-file',
        isTemplate: true,
        isTemporary: true
      }
    }
  },
  {
    get_blockValue: {
      value: {
        get_sequenceValue: '5'
      },
      query: 'id'
    }
  },
  {
    set_dataValue: {
      name: 'component/items',
      value: {
        id: 'label',
        isTemplate: true,
        isTemporary: true
      }
    }
  },
  {
    get_blockValue: {
      value: {
        get_sequenceValue: '7'
      },
      query: 'id'
    }
  },
  {
    set_actionValue: {
      id: {
        get_sequenceValue: '8'
      },
      values: [
        {
          id: 'htmlFor',
          value: {
            get_sequenceValue: '6'
          }
        },
        {
          id: 'text',
          value: 'Change image'
        }
      ]
    }
  },
  {
    set_dataValue: {
      name: 'component/children',
      value: [
        {
          get_sequenceValue: '8'
        },
        {
          get_sequenceValue: '6'
        }
      ],
      options: {
        id: {
          get_contextValue: 'parentId'
        },
        update: {
          method: 'push'
        }
      }
    }
  }
])
