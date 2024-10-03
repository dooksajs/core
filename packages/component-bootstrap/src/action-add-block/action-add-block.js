import {
  extendAccordion, extendAccordionItem
} from '@dooksa/component-extra'
import actionAddBlockHeading from './action-add-block-heading.js'

const actionDetailItem = extendAccordionItem({
  children: [actionAddBlockHeading],
  options: {
    focusRing: true,
    shadow: 'sm'
  },
  events: [
    {
      on: 'component/beforeCreate',
      actionId: 'action-add-block-set-context'
    },
    {
      on: 'node/toggle',
      actionId: 'action-add-block-body'
    }
  ]
})

export default extendAccordion({
  metadata: { id: 'action-add-block' },
  options: { hover: true },
  children: [actionDetailItem]
})
