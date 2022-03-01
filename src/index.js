export default {
  link ({
    id,
    crossOrigin,
    href,
    media,
    referrerPolicy,
    rel = 'stylesheet',
    integrity,
    onSuccess = () => {},
    onError = () => {}
  }) {
    const [element, elementExists] = this._exists(id, 'link', 'href', href)

    element.onerror = () => onError()
    element.onload = () => onSuccess()
    element.id = id
    element.rel = rel
    element.crossOrigin = crossOrigin || null

    if (media) {
      element.media = media
    }

    if (referrerPolicy) {
      element.referrerPolicy = referrerPolicy
    }

    if (integrity) {
      element.integrity = integrity
    }

    element.href = href

    if (!elementExists) {
      document.head.appendChild(element)
    }
  },
  script ({
    id,
    async,
    crossOrigin,
    defer,
    integrity,
    nonce,
    referrerPolicy,
    src,
    type = 'text/javascript',
    nomodule,
    globalVars = [],
    onSuccess = () => {},
    onError = () => {}
  }) {
    const [element, elementExists] = this._exists(id, 'script', 'src', src)

    element.onerror = () => onError()
    element.onload = () => {
      const result = {}

      for (let i = 0; i < globalVars.length; i++) {
        const globalVar = globalVars[i]

        result[globalVar] = window[globalVar]
      }

      onSuccess(result)
    }
    element.id = id
    element.type = type
    element.async = async || null
    element.crossOrigin = crossOrigin || null
    element.defer = defer || null

    if (integrity) {
      element.integrity = integrity
    }

    if (referrerPolicy) {
      element.referrerPolicy = referrerPolicy
    }
    element.nomodule = nomodule || null
    element.nonce = nonce || null
    element.src = src

    if (!elementExists) {
      document.head.appendChild(element)
    }
  },
  _exists (id, type, key, url) {
    let element = document.getElementById(id)
    let elementExists = false

    if (element) {
      if (element[key] === url) {
        return
      }

      elementExists = true
    } else {
      element = document.createElement(type)
    }

    return [element, elementExists]
  }
}
