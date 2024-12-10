import createAction from '@dooksa/create-action'

export default createAction('action-add-block-fetch-actions', [
  {
    fetch_getAll: {
      collection: 'metadata/actions',
      sync: true,
      expand: true
    }
  }
])
