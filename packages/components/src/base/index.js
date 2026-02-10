import { createAnchor, anchor } from './interactive/anchor.js'
import { createButton, button } from './interactive/button.js'
import { createCode, code } from './content/code.js'
import { createDetails, details } from './interactive/details.js'
import { createDiv, div } from './generic/div.js'
import { createFieldset, fieldset } from './form/fieldset.js'
import { createForm, form } from './form/form.js'
import { createFormCheck, formCheck } from './form/form-check.js'
import { createH1, h1 } from './content/h1.js'
import { createH2, h2 } from './content/h2.js'
import { createH3, h3 } from './content/h3.js'
import { createH4, h4 } from './content/h4.js'
import { createH5, h5 } from './content/h5.js'
import { createH6, h6 } from './content/h6.js'
import { createHr, hr } from './generic/hr.js'
import { createImg, img } from './content/img.js'
import { createInputCheckbox, inputCheckbox } from './form/input-checkbox.js'
import { createInputCheckboxButton, inputCheckboxButton } from './form/input-checkbox-button.js'
import { createInputColor, inputColor } from './form/input-color.js'
import { createInputFile, inputFile } from './form/input-file.js'
import { createInputHidden, inputHidden } from './form/input-hidden.js'
import { createInputRadio, inputRadio } from './form/input-radio.js'
import { createInputText, inputText } from './form/input-text.js'
import { createLabel, label } from './form/label.js'
import { createLegend, legend } from './form/legend.js'
import { createOption, option } from './form/option.js'
import { createParagraph, paragraph } from './content/paragraph.js'
import { createSelect, select } from './form/select.js'
import { createSmall, small } from './content/small.js'
import { createSpan, span } from './generic/span.js'
import { createSummary, summary } from './interactive/summary.js'
import { createText, text } from './content/text.js'
import { createCaption, caption } from './table/caption.js'
import { createCol, col } from './table/col.js'
import { createColgroup, colgroup } from './table/colgroup.js'
import { createTable, table } from './table/table.js'
import { createTbody, tbody } from './table/tbody.js'
import { createTd, td } from './table/td.js'
import { createTfoot, tfoot } from './table/tfoot.js'
import { createTh, th } from './table/th.js'
import { createThead, thead } from './table/thead.js'

export * from './types.js'

export {
  createCol,
  createColgroup,
  createTable,
  createTbody,
  createTd,
  createTfoot,
  createTh,
  createThead,
  createAnchor,
  createButton,
  createCode,
  createDetails,
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
  createInputHidden,
  createInputRadio,
  createInputText,
  createLabel,
  createLegend,
  createOption,
  createParagraph,
  createSelect,
  createSmall,
  createSpan,
  createSummary,
  createText,
  createCaption
}

export default [
  col,
  colgroup,
  table,
  tbody,
  tfoot,
  th,
  thead,
  caption,
  anchor,
  button,
  code,
  details,
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
  inputHidden,
  inputRadio,
  inputText,
  label,
  legend,
  option,
  paragraph,
  select,
  small,
  span,
  summary,
  text
]
