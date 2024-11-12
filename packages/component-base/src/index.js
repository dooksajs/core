import { createFieldset, fieldset } from './form/fieldset.js'
import { createH1, h1 } from './content/h1.js'
import { createH2, h2 } from './content/h2.js'
import { createH3, h3 } from './content/h3.js'
import { createH4, h4 } from './content/h4.js'
import { createH5, h5 } from './content/h5.js'
import { createH6, h6 } from './content/h6.js'
import { createSmall, small } from './content/small.js'
import { createImg, img } from './content/img.js'
import { createParagraph, paragraph } from './content/paragraph.js'
import { createText, text } from './content/text.js'
import { createFormCheck, formCheck } from './form/form-check.js'
import { createForm, form } from './form/form.js'
import { createInputCheckboxButton, inputCheckboxButton } from './form/input-checkbox-button.js'
import { createInputCheckbox, inputCheckbox } from './form/input-checkbox.js'
import { createInputColor, inputColor } from './form/input-color.js'
import { createInputFile, inputFile } from './form/input-file.js'
import { createInputText, inputText } from './form/input-text.js'
import { createLabel, label } from './form/label.js'
import { createLegend, legend } from './form/legend.js'
import { createOption, option } from './form/option.js'
import { createSelect, select } from './form/select.js'
import { div, createDiv } from './generic/div.js'
import { createHr, hr } from './generic/hr.js'
import { createSpan, span } from './generic/span.js'
import { anchor, createAnchor } from './interactive/anchor.js'
import { button, createButton } from './interactive/button.js'
import { details, createDetails } from './interactive/details.js'
import { createSummary, summary } from './interactive/summary.js'

export * from './types.js'

export {
  createSmall,
  createDetails,
  createSummary,
  createAnchor,
  createButton,
  createDiv,
  createFieldset,
  createForm,
  createFormCheck,
  createH1,
  createH2,
  createH3,
  createH4,
  createH5,
  createH6,
  createHr,
  createImg,
  createInputCheckbox,
  createInputCheckboxButton,
  createInputColor,
  createInputFile,
  createInputText,
  createLabel,
  createLegend,
  createOption, createSpan, createText
}

export default [
  small,
  summary,
  details,
  anchor,
  button,
  div,
  fieldset,
  form,
  formCheck,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  hr,
  img,
  inputCheckbox,
  inputCheckboxButton,
  inputColor,
  inputFile,
  inputText,
  label,
  legend,
  paragraph,
  select,
  option,
  span,
  text
]
