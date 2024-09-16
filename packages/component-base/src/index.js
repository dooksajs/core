import { div, extendDiv } from './generic/div.js'
import { extendHr, hr } from './generic/hr.js'
import { extendSpan, span } from './generic/span.js'
import { anchor, extendAnchor } from './interactive/anchor.js'
import { button, extendButton } from './interactive/button.js'
import { h1, extendH1 } from './content/h1.js'
import { h2, extendH2 } from './content/h2.js'
import { h3, extendH3 } from './content/h3.js'
import { h4, extendH4 } from './content/h4.js'
import { h5, extendH5 } from './content/h5.js'
import { h6, extendH6 } from './content/h6.js'
import { img, extendImg } from './content/img.js'
import { text, extendText } from './content/text.js'
import { formCheck, extendFormCheck } from './form/form-check.js'
import { inputCheckbox, extendInputCheckbox } from './form/input-checkbox.js'
import { inputCheckboxButton, extendInputCheckboxButton } from './form/input-checkbox-button.js'
import { inputColor, extendInputColor } from './form/input-color.js'
import { inputFile, extendInputFile } from './form/input-file.js'
import { inputText, extendInputText } from './form/input-text.js'
import { label, extendLabel } from './form/label.js'
import { form, extendForm } from './form/form.js'
import { select, extendSelect } from './form/select.js'
import { selectOption, extendSelectOption } from './form/select-option.js'

export {
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
  extendSelect,
  extendSelectOption,
  extendText,
  extendSpan
}

export default [
  div,
  hr,
  anchor,
  span,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  img,
  button,
  text,
  formCheck,
  inputCheckbox,
  inputCheckboxButton,
  inputColor,
  inputFile,
  inputText,
  label,
  form,
  select
]
