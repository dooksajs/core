import { definePlugin } from '@dooksa/ds-app'
import chalk from 'chalk'

/**
 * Error handler for Dooksa plugins
 * @namespace dsLog
 */
export default definePlugin({
  name: 'dsLog',
  version: 1,
  data: {
    theme: {
      private: true,
      default: () => ({
        primary: '#0d6efd',
        secondary: '#6c757d',
        success: '#198754',
        info: '#0dcaf0',
        danger: '#dc3545',
        light: '#f8f9fa',
        dark: '#212529'
      })
    }
  },
  setup ({ theme }) {
    if (theme) {
      this.theme = Object.assign(this.theme, theme)
    }


  },
  methods: {
    $log (type, message, store) {

    }
  }
})
