import { createDiv } from '@dooksa/components/base'
import dataCollectionSelect from './data-collection-select.js'
import actionCardBodyLabelRequired from '../action-card/action-card-body-label-required.js'

export default createDiv({
  metadata: { id: 'data-select-document-by-id' },
  children: [actionCardBodyLabelRequired, dataCollectionSelect],
  events: [
    {
      on: 'component/beforeChildren',
      actionId: 'data-collection-label'
    }
  ]
})
