import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'button'
  },
  data: {
    options: {
      btnVariant: {
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
      btnSize: {
        name: 'className',
        values: {
          small: 'btn-sm',
          large: 'btn-lg'
        }
      },
      btnClose: {
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
  }
})

