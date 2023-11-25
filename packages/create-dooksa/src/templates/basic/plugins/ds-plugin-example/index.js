import { definePlugin } from '@dooksa/utils'

export default definePlugin({
  name: 'dsExample',
  version: 1,
  data: {
    count: {
      description: 'Store count in global state',
      schema: {
        type: 'number'
      }
    }
  },
  methods: {
    /**
     * Increments the global dsExample/count value
     * @returns {number} count number
     */
    increment () {
      // get count value from shared state
      const countData = this.$getDataValue('dsExample/count')

      // increment count
      const count = countData.item + 1

      // set shared state count value
      this.$setDataValue('dsExample/count', count)

      return count
    }
  }
})
