import { createButton, createDiv, createForm, createH1, createInputText, createLabel, createParagraph, createText } from '@dooksa/component-base'

// header
const headerText = createText({
  options: {
    value: 'Create action'
  }
})
const header = createH1({
  children: [headerText],
  options: {
    margin: [{
      direction: 'bottom',
      strength: '0'
    }]
  }
})
const leadText = createText({
  options: {
    value: 'Start programming! Construct a sequence of action blocks'
  }
})
const lead = createParagraph({
  children: [leadText],
  options: {
    headingLead: true
  }
})

// Title input
const titleText = createText({
  options: {
    value: 'Title'
  }
})
const titleLabel = createLabel({
  children: [titleText],
  options: {
    formLabel: true,
    for: 'action-title'
  },
  events: [
    {
      on: 'component/created',
      actionId: 'label-html-for'
    }
  ]
})
const titleInput = createInputText({
  options: {
    required: true,
    id: 'action-title',
    name: 'title',
    formControlSize: 'lg',
    placeholder: 'Add action title...'
  },
  events: [
    {
      on: 'component/created',
      actionId: 'input-id'
    }
  ]
})

// form footer
const submitBtnText = createText({
  options: {
    value: 'Save'
  }
})
const submitBtn = createButton({
  children: [submitBtnText],
  options: {
    btn: true,
    btnVariant: 'primary',
    type: 'submit'
  }
})
const formFooter = createDiv({
  children: [submitBtn],
  options: {
    padding: [{
      direction: 'yAxis',
      strength: '3'
    }],
    border: 'top'
  }
})

const formContainer = createDiv({
  options: {
    padding: [{
      direction: 'yAxis',
      strength: '4'
    }]
  },
  events: [{
    on: 'component/beforeCreate',
    actionId: 'action-editor-add-button-condition'
  },
  {
    on: 'component/childrenBeforeUpdate',
    actionId: 'action-editor-add-button-condition'
  }]
})

const form = createForm({
  children: [titleLabel, titleInput, formContainer, formFooter]
})

export default createDiv({
  metadata: {
    id: 'action-editor-container'
  },
  children: [header, lead, form],
  options: {
    container: [{
      breakpoint: 'always'
    }],
    display: [{
      type: 'grid'
    }],
    gapRow: '3'
  }
})
