window.dsAppCache = {
  app: {
    locale: 'en',
    id: 'appId_1',
    theme: 'bootstrap'
  },
  actions: {
    items: {
      actionId_1: [
        {
          itemId: 'a1',
          items: {
            a1: {
              type: 'pluginAction',
              name: 'dsApp/fetch',
              paramType: 'value',
              computedParams: true,
              params: {
                _$id: 'edKyDTabvrMacFXky'
              },
              onSuccess: ['a2']
            },
            a2: {
              type: 'pluginAction',
              name: 'dsApp/set',
              paramType: 'value',
              computedParams: true,
              params: {
                _$id: 'p1'
              },
              onSuccess: ['qKkGkDZzdWIIoAaYy']
            },
            qKkGkDZzdWIIoAaYy: {
              type: 'pluginAction',
              name: 'dsApp/update',
              paramType: 'object',
              computedParams: true,
              params: [
                ['prevPageId', {
                  _$id: 'khTXJNwpOwoddIceG'
                }],
                ['nextPageId', {
                  _$id: 'edKyDTabvrMacFXky'
                }]
              ]
            }
          }
        }
      ]
    }
  },
  params: {
    items: {
      p1: {
        _$computed: true,
        name: 'getter/parent/value',
        params: {
          value: true
        }
      },
      edKyDTabvrMacFXky: {
        _$computed: true,
        name: 'getter/plugin/method',
        params: {
          _$computedParams: true,
          paramType: 'value',
          name: 'dsRouter/getPathById',
          params: {
            _$computed: true,
            name: 'getter/this/value'
          }
        }
      },
      khTXJNwpOwoddIceG: {
        _$computed: true,
        name: 'getter/plugin/method',
        params: {
          name: 'dsRouter/getCurrentPath'
        }
      }
    },
    usedBy: {
      p1: {
        a2: true
      },
      edKyDTabvrMacFXky: {
        actionId_1: true
      },
      khTXJNwpOwoddIceG: {
        actionId_1: true
      }
    }
  },
  pages: {
    pageDocId_1: {
      cache: true,
      owner: 'userId',
      created: '1644932021700',
      updated: '1644932021700',
      pageTypeId: 'pageTypeDocId_1',
      descriptionContentId: '',
      imageContentId: '',
      titleContentId: ''
    }
  },
  pageTypes: {
    pageTypeDocId_1: {
      cache: true,
      created: '1644932021700',
      updated: '1644932021700',
      templateId: 'templateDocId_1',
      title: 'Page'
    }
  },
  templates: {
    templateDocId_1: {
      cache: true,
      widgets: [
        'baseWidgetInstanceId_1'
      ],
      classList: [
        'bg-light'
      ]
    }
  },
  routes: {
    '/': 'pageDocId_1'
  },
  content: {
    contentId_1: {
      type: 'text',
      value: 'Foo'
    },
    contentId_2: {
      type: 'link',
      value: {
        href: '/foo'
      }
    },
    contentId_3: {
      type: 'section',
      value: 'widgetInstanceId_1'
    },
    contentId_4: {
      type: 'text',
      value: 'Bar'
    },
    contentId_5: {
      type: 'link',
      value: {
        href: '/'
      }
    }
  },
  widgets: {
    baseItems: {
      baseWidgetInstanceId_1: [
        {
          groupId: 'widgetGroupId_1',
          layoutId: 'layoutDocId_1',
          instanceId: 'widgetInstanceId_1'
        }
      ]
    },
    content: {
      widgetInstanceId_1: [
        {
          id: 'contentId_1',
          type: 'text'
        },
        {
          id: 'contentId_2',
          type: 'link'
        }
      ],
      widgetInstanceId_2: [
        {
          id: 'contentId_3',
          type: 'section'
        }
      ],
      widgetInstanceId_3: [
        {
          id: 'contentId_4',
          type: 'text'
        },
        {
          id: 'contentId_5',
          type: 'link'
        }
      ]
    },
    children: {
      layoutDocId_1: [0]
    },
    layout: {
      layoutDocId_1: [
        {
          children: [1],
          component: {
            id: 'dsDiv',
            type: 'element',
            classList: ['container', 'my-5']
          }
        },
        {
          contentIndex: 1,
          children: [2],
          component: {
            id: 'dsAnchor',
            type: 'element',
            classList: ['btn', 'btn-link']
          }
        },
        {
          contentIndex: 0,
          component: {
            id: 'dsText',
            type: 'node'
          }
        }
      ]
    }
  }
}
