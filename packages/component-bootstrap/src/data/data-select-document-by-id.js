import { extendDiv } from '@dooksa/component-base'
import dataCollectionSelect from './data-collection-select.js'
import actionCardBodyLabelRequired from '../action-card/action-card-body-label-required.js'

export default extendDiv({
  metadata: { id: 'data-select-document-by-id' },
  children: [actionCardBodyLabelRequired, dataCollectionSelect],
  events: [
    {
      on: 'component/beforeCreate',
      actionId: 'data-collection-label'
    },
    {
      on: 'component/beforeCreate',
      actionId: 'data-document-root-id'
    }
  ]
})
