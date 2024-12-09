import createAction from '@dooksa/create-action'

export default createAction('edit-img', [
  { // get content id
    action_getDataValue: {
      name: 'component/content',
      id: {
        action_getContextValue: 'id'
      }
    }
  },
  { // set image component
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'img',
        isTemplate: true,
        isTemporary: true
      }
    }
  },
  { // component id
    action_getBlockValue: {
      value: {
        $ref: 1
      },
      query: 'id'
    }
  },
  { // add image
    state_setValue: {
      name: 'component/children',
      value: {
        $ref: 2
      },
      options: {
        id: {
          action_getContextValue: 'parentId'
        },
        update: {
          method: 'push'
        }
      }
    }
  },
  { // update image content
    state_setValue: {
      name: 'content/items',
      value: {
        action_getDataValue: {
          name: 'content/items',
          id: {
            $ref: 0
          }
        }
      },
      options: {
        id: {
          action_getDataValue: {
            name: 'component/content',
            id: {
              $ref: 2
            }
          }
        }
      }
    }
  },
  {
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'input-file',
        isTemplate: true,
        isTemporary: true
      }
    }
  },
  {
    action_getBlockValue: {
      value: {
        $ref: 5
      },
      query: 'id'
    }
  },
  {
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'label',
        isTemplate: true,
        isTemporary: true
      }
    }
  },
  {
    action_getBlockValue: {
      value: {
        $ref: 7
      },
      query: 'id'
    }
  },
  {
    variable_setValue: {
      scope: {
        $ref: 8
      },
      values: [
        {
          id: 'htmlFor',
          value: {
            $ref: 6
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
    state_setValue: {
      name: 'component/children',
      value: [
        {
          $ref: 8
        },
        {
          $ref: 6
        }
      ],
      options: {
        id: {
          action_getContextValue: 'parentId'
        },
        update: {
          method: 'push'
        }
      }
    }
  }
])
