import { extendTabContent, extendTabPane } from '@dooksa/component-extra'

const tabPane = extendTabPane({
  options: {
    active: true
  }
})

export default extendTabContent({
  metadata: {
    id: 'action-tab-content'
  },
  children: [tabPane],
  options: {
    border: 'all',
    borderRemove: 'top',
    roundedBottom: '1',
    padding: {
      strength: '3'
    },
    margin: {
      direction: 'bottom',
      strength: '3'
    }
  }
})
