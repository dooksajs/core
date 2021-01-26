import firebase from './firebase/firebase'
import fireFirestore from './firebase/fireFirestore'
import fireAuth from './firebase/fireAuth'

export default {
  firebase: {
    current: firebase,
    items: {
      '8.2.3': {
        fetch: false,
        current: firebase
      }
    }
  },
  fireFirestore: {
    current: fireFirestore,
    items: {
      '8.2.3': {
        current: fireFirestore
      }
    }
  },
  fireAuth: {
    current: fireAuth,
    items: {
      '8.2.3': {
        current: fireAuth
      }
    }
  }
}
