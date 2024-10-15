import { createTabContent, createTabPane } from '@dooksa/component-extra'

const tabPane = createTabPane({
  options: {
    active: true
  }
})

export default createTabContent({
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
