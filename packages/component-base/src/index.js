import { extendH1, h1 } from './content/h1.js'
import { extendH2, h2 } from './content/h2.js'
import { extendH3, h3 } from './content/h3.js'
import { extendH4, h4 } from './content/h4.js'
import { extendH5, h5 } from './content/h5.js'
import { extendH6, h6 } from './content/h6.js'
import { extendImg, img } from './content/img.js'
import { extendParagraph, paragraph } from './content/paragraph.js'
import { extendText, text } from './content/text.js'
import { extendFormCheck, formCheck } from './form/form-check.js'
import { extendForm, form } from './form/form.js'
import { extendInputCheckboxButton, inputCheckboxButton } from './form/input-checkbox-button.js'
import { extendInputCheckbox, inputCheckbox } from './form/input-checkbox.js'
import { extendInputColor, inputColor } from './form/input-color.js'
import { extendInputFile, inputFile } from './form/input-file.js'
import { extendInputText, inputText } from './form/input-text.js'
import { extendLabel, label } from './form/label.js'
import { extendOption, option } from './form/option.js'
import { extendSelect, select } from './form/select.js'
import { div, extendDiv } from './generic/div.js'
import { extendHr, hr } from './generic/hr.js'
import { extendSpan, span } from './generic/span.js'
import { anchor, extendAnchor } from './interactive/anchor.js'
import { button, extendButton } from './interactive/button.js'
import { details, extendDetails } from './interactive/details.js'
import { extendSummary, summary } from './interactive/summary.js'

export * from './types.js'

export {
  extendDetails,
  extendSummary,
  extendAnchor,
  extendButton,
  extendDiv,
  extendForm,
  extendFormCheck,
  extendH1,
  extendH2,
  extendH3,
  extendH4,
  extendH5,
  extendH6,
  extendHr,
  extendImg,
  extendInputCheckbox,
  extendInputCheckboxButton,
  extendInputColor,
  extendInputFile,
  extendInputText,
  extendLabel,
  extendParagraph, extendSelect,
  extendOption, extendSpan, extendText
}

export default [
  summary,
  details,
  anchor,
  button,
  div,
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
  paragraph,
  select,
  option,
  span,
  text
]
