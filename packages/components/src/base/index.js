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

import { createAddress, address } from './generic/address.js'
import { createArticle, article } from './generic/article.js'
import { createAside, aside } from './generic/aside.js'
import { createFooter, footer } from './generic/footer.js'
import { createHeader, header } from './generic/header.js'
import { createHgroup, hgroup } from './generic/hgroup.js'
import { createMain, main } from './generic/main.js'
import { createNav, nav } from './generic/nav.js'
import { createSection, section } from './generic/section.js'
import { createSearch, search } from './generic/search.js'

import { createBlockquote, blockquote } from './content/blockquote.js'
import { createDd, dd } from './content/dd.js'
import { createDl, dl } from './content/dl.js'
import { createDt, dt } from './content/dt.js'
import { createFigcaption, figcaption } from './content/figcaption.js'
import { createFigure, figure } from './content/figure.js'
import { createLi, li } from './content/li.js'
import { createOl, ol } from './content/ol.js'
import { createPre, pre } from './content/pre.js'
import { createUl, ul } from './content/ul.js'

import { createAbbr, abbr } from './content/abbr.js'
import { createB, b } from './content/b.js'
import { createBdi, bdi } from './content/bdi.js'
import { createBdo, bdo } from './content/bdo.js'
import { createBr, br } from './content/br.js'
import { createCite, cite } from './content/cite.js'
import { createData, data } from './content/data.js'
import { createDfn, dfn } from './content/dfn.js'
import { createEm, em } from './content/em.js'
import { createI, i } from './content/i.js'
import { createKbd, kbd } from './content/kbd.js'
import { createMark, mark } from './content/mark.js'
import { createQ, q } from './content/q.js'
import { createRp, rp } from './content/rp.js'
import { createRt, rt } from './content/rt.js'
import { createRuby, ruby } from './content/ruby.js'
import { createS, s } from './content/s.js'
import { createSamp, samp } from './content/samp.js'
import { createStrong, strong } from './content/strong.js'
import { createSub, sub } from './content/sub.js'
import { createSup, sup } from './content/sup.js'
import { createTime, time } from './content/time.js'
import { createU, u } from './content/u.js'
import { createVar, varEl } from './content/var.js'
import { createWbr, wbr } from './content/wbr.js'
import { createDel, del } from './content/del.js'
import { createIns, ins } from './content/ins.js'

import { createArea, area } from './content/area.js'
import { createAudio, audio } from './content/audio.js'
import { createMap, map } from './content/map.js'
import { createTrack, track } from './content/track.js'
import { createVideo, video } from './content/video.js'
import { createPicture, picture } from './content/picture.js'
import { createSource, source } from './content/source.js'

import { createEmbed, embed } from './content/embed.js'
import { createIframe, iframe } from './content/iframe.js'
import { createObject, object } from './content/object.js'
import { createParam, param } from './content/param.js'
import { createCanvas, canvas } from './content/canvas.js'

import { createDatalist, datalist } from './form/datalist.js'
import { createMeter, meter } from './form/meter.js'
import { createOptgroup, optgroup } from './form/optgroup.js'
import { createOutput, output } from './form/output.js'
import { createProgress, progress } from './form/progress.js'
import { createTextarea, textarea } from './form/textarea.js'

import { createInputButton, inputButton } from './form/input-button.js'
import { createInputDate, inputDate } from './form/input-date.js'
import { createInputDatetimeLocal, inputDatetimeLocal } from './form/input-datetime-local.js'
import { createInputEmail, inputEmail } from './form/input-email.js'
import { createInputImage, inputImage } from './form/input-image.js'
import { createInputMonth, inputMonth } from './form/input-month.js'
import { createInputNumber, inputNumber } from './form/input-number.js'
import { createInputPassword, inputPassword } from './form/input-password.js'
import { createInputRange, inputRange } from './form/input-range.js'
import { createInputReset, inputReset } from './form/input-reset.js'
import { createInputSearch, inputSearch } from './form/input-search.js'
import { createInputSubmit, inputSubmit } from './form/input-submit.js'
import { createInputTel, inputTel } from './form/input-tel.js'
import { createInputTime, inputTime } from './form/input-time.js'
import { createInputUrl, inputUrl } from './form/input-url.js'
import { createInputWeek, inputWeek } from './form/input-week.js'

import { createDialog, dialog } from './interactive/dialog.js'
import { createMenu, menu } from './interactive/menu.js'

export * from './types.js'

export {
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
  createAddress,
  createArticle,
  createAside,
  createFooter,
  createHeader,
  createHgroup,
  createMain,
  createNav,
  createSection,
  createSearch,
  createBlockquote,
  createDd,
  createDl,
  createDt,
  createFigcaption,
  createFigure,
  createLi,
  createOl,
  createPre,
  createUl,
  createAbbr,
  createB,
  createBdi,
  createBdo,
  createBr,
  createCite,
  createData,
  createDfn,
  createEm,
  createI,
  createKbd,
  createMark,
  createQ,
  createRp,
  createRt,
  createRuby,
  createS,
  createSamp,
  createStrong,
  createSub,
  createSup,
  createTime,
  createU,
  createVar,
  createWbr,
  createDel,
  createIns,
  createArea,
  createAudio,
  createMap,
  createTrack,
  createVideo,
  createPicture,
  createSource,
  createEmbed,
  createIframe,
  createObject,
  createParam,
  createCanvas,
  createDatalist,
  createMeter,
  createOptgroup,
  createOutput,
  createProgress,
  createTextarea,
  createInputButton,
  createInputDate,
  createInputDatetimeLocal,
  createInputEmail,
  createInputImage,
  createInputMonth,
  createInputNumber,
  createInputPassword,
  createInputRange,
  createInputReset,
  createInputSearch,
  createInputSubmit,
  createInputTel,
  createInputTime,
  createInputUrl,
  createInputWeek,
  createDialog,
  createMenu
}

export default [
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
  text,
  address,
  article,
  aside,
  footer,
  header,
  hgroup,
  main,
  nav,
  section,
  search,
  blockquote,
  dd,
  dl,
  dt,
  figcaption,
  figure,
  li,
  ol,
  pre,
  ul,
  abbr,
  b,
  bdi,
  bdo,
  br,
  cite,
  data,
  dfn,
  em,
  i,
  kbd,
  mark,
  q,
  rp,
  rt,
  ruby,
  s,
  samp,
  strong,
  sub,
  sup,
  time,
  u,
  varEl,
  wbr,
  del,
  ins,
  area,
  audio,
  map,
  track,
  video,
  picture,
  source,
  embed,
  iframe,
  object,
  param,
  canvas,
  datalist,
  meter,
  optgroup,
  output,
  progress,
  textarea,
  inputButton,
  inputDate,
  inputDatetimeLocal,
  inputEmail,
  inputImage,
  inputMonth,
  inputNumber,
  inputPassword,
  inputRange,
  inputReset,
  inputSearch,
  inputSubmit,
  inputTel,
  inputTime,
  inputUrl,
  inputWeek,
  dialog,
  menu
]
