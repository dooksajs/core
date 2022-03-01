window.dsAppCache = {
  app: {
    locale: 'en',
    id: 'appId_1',
    theme: 'bootstrap'
  },
  pages: {
    pageDocId_2: {
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
    '/foo': 'pageDocId_2'
  },
  content: {
    contentId_3: {
      type: 'text',
      value: 'Bar'
    },
    contentId_4: {
      type: 'link',
      value: {
        href: '/bar'
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
    content: {
      widgetInstanceId_3: [
        {
          id: 'contentId_3',
          type: 'text'
        },
        {
          id: 'contentId_4',
          type: 'link'
        }
      ]
    },
    children: {
      layoutDocId_2: [0]
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
      ]
    }
  }
}
