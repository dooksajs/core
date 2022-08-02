window.dsAppCache = {
  id: 'page_foo',
  metadata: {
    owner: 'userId',
    created: '1644932021700',
    updated: '1644932021700',
    pageTypeId: 'pageTemplate_2',
    descriptionContentId: '',
    imageContentId: '',
    titleContentId: ''
  },
  app: {
    id: 'appId_1',
    theme: 'bootstrap'
  },
  pageType: {
    id: 'pageTemplate_2',
    created: '1644932021700',
    updated: '1644932021700',
    templateId: 'template_2',
    title: 'Page'
  },
  templates: {
    pageTemplate_2: [],
    template_2: {
      name: 'Main',
      main: '_ZPhyHOc6A3HwPrLMH3b1YN',
      widgets: ['_ZPhyHOc6A3HwPrLMH3b1YN']
    }
  },
  routes: {
    currentPath: '/foo',
    paths: ['/foo']
  },
  widgets: {
    items: {
      _ZPhyHOc6A3HwPrLMH3b1YN: [
        {
          groupId: '_fxsvSTurDPdbRakFLxCK4p',
          instanceId: '_FxsvSTurDPdbRakFLxCK4p',
          layout: {
            default: { id: '_BIAklh1FkBmDPibBeDyvlg' },
            edit: { id: '_H2e4SzLZHVwebhHxkUbSlw', templateId: '_lDZKiYj73WWRlL3RVyeMO8', modifierId: '_wcx_d77j_LAySA_zzdfPew' }
          }
        },
        {
          groupId: '_fxsvSTurDPdbRakFLxCK4P',
          instanceId: '_FosvSTurDPdbRakFLxCK4p',
          layout: {
            default: { id: '_BIAklh1FkBmDPibBeDyvla' }
          }
        }
      ]
    },
    loaded: {
      _ZPhyHOc6A3HwPrLMH3b1YN_FxsvSTurDPdbRakFLxCK4p_default: true,
      _ZPhyHOc6A3HwPrLMH3b1YN_FosvSTurDPdbRakFLxCK4p_default: true
    },
    content: {
      _ZPhyHOc6A3HwPrLMH3b1YN_FxsvSTurDPdbRakFLxCK4p_default: [
        '_kdgOHycw4QG7i5ftSdoFRg'
      ],
      _ZPhyHOc6A3HwPrLMH3b1YN_FosvSTurDPdbRakFLxCK4p_default: [
        '_fdgOHycw4QG7i5ftSdoFRa',
        '_fdgOHycw4QG7i5ftSdoFRt'
      ]
    },
    layout: {
      _ZPhyHOc6A3HwPrLMH3b1YN_FxsvSTurDPdbRakFLxCK4p_default: '_wcx_d77j_LAySA_zzdfPew'
    },
    templates: {
      _wcx_d77j_LAySA_zzdfPew: {
        _rvMd83GSZuYVdwgUxRYWvK_lkZxHJt5396RqwdoTsDZIA: '_wcx_d77j_LAySA_zzdfPew'
      }
    }
  },
  elements: {
    value: {
      _fdgOHycw4QG7i5ftSdoFRt: {
        default: 'Bar'
      },
      _fdgOHycw4QG7i5ftSdoFRa: {
        default: '/bar'
      },
      _kdgOHycw4QG7i5ftSdoFRg: {
        default: 'http://localhost:8080/assets/images/photo-default.jpeg',
        fr: 'http://localhost:8080/assets/images/photo-fr.jpeg',
        es: 'http://localhost:8080/assets/images/photo-es.jpeg'
      }
    },
    type: {
      _kdgOHycw4QG7i5ftSdoFRg: ['image', true],
      _fdgOHycw4QG7i5ftSdoFRa: ['link', true],
      _fdgOHycw4QG7i5ftSdoFRt: ['text', true]
    }
  },
  components: {
    _wcx_d77j_LAySA_zzdfPep: ['dsDiv', {
      className: 'container'
    }],
    _wcx_d77j_LAySA_zzdfPew: ['dsImg', {
      className: 'img-fluid rounded'
    }],
    _wcx_d77j_LAySA_zzdfPeW: ['dsImg', {
      className: 'img-fluid rounded shadow'
    }],
    _wcx_d77j_LAySA_zzdfPea: ['dsA'],
    _wcx_d77j_LAySA_zzdfPet: ['dsText']
  },
  layouts: {
    items: {
      _BIAklh1FkBmDPibBeDyvla: [
        {
          children: [1],
          componentId: '_wcx_d77j_LAySA_zzdfPep'
        },
        {
          children: [2],
          parentIndex: 0,
          componentId: '_wcx_d77j_LAySA_zzdfPea',
          contentIndex: 0
        },
        {
          parentIndex: 1,
          componentId: '_wcx_d77j_LAySA_zzdfPet',
          contentIndex: 1
        }
      ]
    },
    modifiers: {
      _wcx_d77j_LAySA_zzdfPew: {
        1: '_wcx_d77j_LAySA_zzdfPeW'
      }
    }
  }
}
