import {
  extendAccordionBody, extendAccordionHeader, extendAccordionItem
} from '@dooksa/component-extra'
import { extendText } from '@dooksa/component-base'

const body = extendAccordionBody({
  events: [
    {
      on: 'component/mount',
      actionId: 'action-card-accordion-body'
    }
  ]
})

const headerText = extendText({
  events: [
    {
      on: 'component/mount',
      actionId: 'action-card-accordion-header-text'
    }
  ]
})

const header = extendAccordionHeader({
  children: [headerText]
})

export default extendAccordionItem({
  metadata: {
    id: 'action-card-accordion-item'
  },
  children: [header, body]
})
