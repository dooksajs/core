import {
  createAccordion, createAccordionItem
} from '@dooksa/components/extra'
import actionAddBlockHeading from './action-add-block-heading.js'

const actionDetailItem = createAccordionItem({
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
      on: 'node/mouseenter',
      actionId: 'action-add-block-fetch-actions'
    },
    {
      on: 'node/toggle',
      actionId: 'action-add-block-body'
    }
  ]
})

export default createAccordion({
  metadata: { id: 'action-add-block' },
  options: { hover: true },
  children: [actionDetailItem]
})
