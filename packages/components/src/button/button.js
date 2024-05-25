import createComponent from '@dooksa/create-component'
import text from '../text/text.js'
import icon from '../icon/icon.js'

const textChild = text.modify({ text: 'Button' })

export default createComponent({
  id: 'button',
  tag: 'button',
  children: [textChild, icon.modify({ icon: 'material-symbols:info-outline' })],
  allowedChildren: [textChild, icon],
  properties: [
    {
      name: 'type',
      value: 'button'
    },
    { name: 'className',
      value: 'btn'
    }
  ],
  options: {
    type: {
      name: 'type',
      values: {
        button: 'button',
        reset: 'rest',
        submit: 'submit'
      }
    },
    variant: {
      name: 'className',
      join: true,
      values: {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'btn-success',
        warning: 'btn-warning',
        danger: 'btn-danger',
        info: 'btn-info',
        light: 'btn-light',
        dark: 'btn-dark',
        link: 'btn-link',
        outlinePrimary: 'btn-outline-primary',
        outlineSecondary: 'btn-outline-secondary',
        outlineSuccess: 'btn-outline-success',
        outlineDanger: 'btn-outline-danger',
        outlineWarning: 'btn-outline-warning',
        outlineInfo: 'btn-outline-info',
        outlineLight: 'btn-outline-light',
        outlineDark: 'btn-outline-dark'
      }
    },
    close: {
      name: 'className',
      values: {
        close: 'btn-close'
      }
    }
  },
  styles: [
    {
      name: 'btn-padding-x',
      type: 'unit'
    },
    {
      name: 'btn-font-family',
      type: 'font-family'
    },
    {
      name: 'btn-font-weight',
      type: 'unit'
    },
    {
      name: 'btn-line-height',
      type: 'number'
    },
    {
      name: 'btn-color',
      type: 'rgba'
    },
    {
      name: 'btn-bg',
      type: 'rgba'
    },
    {
      name: 'btn-border-width',
      type: 'unit'
    },
    {
      name: 'btn-border-color',
      type: 'rgba'
    },
    {
      name: 'btn-border-radius',
      type: 'unit'
    },
    {
      name: 'btn-hover-border-color',
      type: 'rgba'
    },
    {
      name: 'btn-box-shadow',
      type: 'box-shadow'
    },
    {
      name: 'btn-disabled-opacity',
      type: 'unit'
    },
    {
      name: 'btn-focus-box-shadow',
      type: 'box-shadow'
    }
  ]
})
