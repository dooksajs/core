
/**
 * @typedef {import('../../global-typedef.js').DataSchema} DataSchema
 * @typedef {import('../../global-typedef.js').SetDataOptions} SetDataOptions
 * @typedef {import('@dooksa/libraries').DataResult} DataResult
 */

/**
 * @typedef {Object} DefineDsData - Dooksa plugin data
 * @property {(Function|string)} [default] - Default value to be set
 * @property {DataSchema} [schema] - The data schema
 * @property {string} [description] - Description of data set
 */


const getData = (data) => {
  return (name) => {
    return {
      values: data.values[name],
      schema: data.schema[name]
    }
  }
}

export { getData }
