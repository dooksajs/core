window.dsAppCache = {
  app: {
    locale: 'en',
    id: 'appId_1',
    theme: 'bootstrap'
  },
  pages: {
    pageDocId_3: {
      cache: true,
      owner: 'userId',
      created: '1644932021700',
      updated: '1644932021700',
      pageTypeId: 'pageTypeDocId_2',
      descriptionContentId: '',
      imageContentId: '',
      titleContentId: ''
    }
  },
  pageTypes: {
    pageTypeDocId_2: {
      cache: true,
      created: '1644932021700',
      updated: '1644932021700',
      templateId: 'templateDocId_2',
      title: 'Page'
    }
  },
  templates: {
    templateDocId_2: {
      cache: true,
      widgets: [
        'baseWidgetInstanceId_2'
      ],
      classList: [
        'bg-dark'
      ]
    }
  },
  routes: {
    '/bar': 'pageDocId_3'
  },
  content: {
    contentId_7: {
      type: 'text',
      value: 'Foo'
    },
    contentId_8: {
      type: 'link',
      value: {
        href: '/foo'
      }
    },
    contentId_5: {
      type: 'text',
      value: 'Dooksa'
    },
    contentId_6: {
      type: 'link',
      value: {
        href: '/'
      }
    },
    contentId_9: {
      type: 'image',
      value: {
        src: 'https://cdn.dooksa.com/file/dooksa/app/images/appId_1/terra-4hJzQF7G0HE-unsplash.jpg',
        alt: 'hello',
        height: '300',
        width: '300'
      }
    }
  },
  widgets: {
    baseItems: {
      baseWidgetInstanceId_2: [
        {
          groupId: 'widgetGroupId_2',
          layoutId: 'layoutDocId_2',
          instanceId: 'widgetInstanceId_3'
        }
      ]
    },
    items: {
      pageDocId_3__baseWidgetInstanceId_2: [
        {
          groupId: 'widgetGroupId_3',
          layoutId: 'layoutDocId_4',
          instanceId: 'widgetInstanceId_8'
        },
        {
          groupId: 'widgetGroupId_2',
          layoutId: 'layoutDocId_2',
          instanceId: 'widgetInstanceId_4'
        },
        {
          groupId: 'widgetGroupId_4',
          layoutId: 'layoutDocId_3',
          instanceId: 'widgetInstanceId_5'
        },
        {
          groupId: 'widgetGroupId_5',
          layoutId: 'layoutDocId_5',
          instanceId: 'widgetInstanceId_6'
        }
      ]
    },
    content: {
      widgetInstanceId_4: [
        {
          id: 'contentId_5',
          type: 'text'
        },
        {
          id: 'contentId_6',
          type: 'link'
        }
      ],
      widgetInstanceId_5: [
        {
          id: 'contentId_7',
          type: 'text'
        },
        {
          id: 'contentId_8',
          type: 'link'
        }
      ],
      widgetInstanceId_8: [
        {
          id: 'contentId_5',
          type: 'text'
        },
        {
          id: 'contentId_6',
          type: 'link'
        }
      ],
      widgetInstanceId_6: [
        {
          id: 'contentId_9',
          type: 'image'
        },
        {
          id: 'contentId_5',
          type: 'text'
        }
      ]
    },
    children: {
      layoutDocId_2: [0],
      layoutDocId_3: [0],
      layoutDocId_4: [0],
      layoutDocId_5: [0]
    },
    layout: {
      layoutDocId_2: [
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
            classList: ['btn', 'btn-primary']
          }
        },
        {
          contentIndex: 0,
          component: {
            id: 'dsText',
            type: 'node'
          }
        }
      ],
      layoutDocId_3: [
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
            classList: ['btn', 'btn-secondary']
          }
        },
        {
          contentIndex: 0,
          component: {
            id: 'dsText',
            type: 'node'
          }
        }
      ],
      layoutDocId_4: [
        {
          children: [1],
          component: {
            id: 'dsDiv',
            type: 'element',
            classList: ['navbar', 'navbar-expand-lg', 'navbar-light', 'bg-light']
          }
        },
        {
          children: [2],
          component: {
            id: 'dsDiv',
            type: 'element',
            classList: ['container-fluid']
          }
        },
        {
          contentIndex: 1,
          children: [3],
          component: {
            id: 'dsAnchor',
            type: 'element',
            classList: ['navbar-brand']
          }
        },
        {
          contentIndex: 0,
          component: {
            id: 'dsText',
            type: 'node'
          }
        }
      ],
      layoutDocId_5: [
        {
          children: [1],
          component: {
            id: 'dsDiv',
            type: 'element',
            classList: ['container', 'my-5']
          }
        },
        {
          children: [2, 3, 4],
          component: {
            id: 'dsDiv',
            type: 'element',
            classList: ['row']
          }
        },
        {
          children: [5],
          component: {
            id: 'dsDiv',
            type: 'element',
            classList: ['col']
          }
        },
        {
          children: [5],
          component: {
            id: 'dsDiv',
            type: 'element',
            classList: ['col']
          }
        },
        {
          children: [5],
          component: {
            id: 'dsDiv',
            type: 'element',
            classList: ['col']
          }
        },
        {
          children: [6, 7],
          component: {
            id: 'dsDiv',
            type: 'element',
            classList: ['card']
          }
        },
        {
          contentIndex: 0,
          component: {
            id: 'dsImage',
            type: 'element',
            classList: ['card-img-top', 'img-fluid']
          }
        },
        {
          children: [8],
          component: {
            id: 'dsDiv',
            type: 'element',
            classList: ['card-body']
          }
        },
        {
          contentIndex: 1,
          component: {
            id: 'dsH5',
            type: 'element',
            classList: ['card-text']
          }
        }
      ]
    }
  }
}
