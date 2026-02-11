import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} MediaMixin
 * @property {boolean} [controls] - If true, the browser will offer controls to allow the user to control video playback
 * @property {boolean} [autoplay] - A Boolean attribute; if specified, the video automatically begins to play back as soon as it can do so without stopping to finish loading the data
 * @property {boolean} [loop] - A Boolean attribute; if specified, we will, upon reaching the end of the video, automatically seek back to the start
 * @property {boolean} [muted] - A Boolean attribute which indicates the default setting of the audio contained in the video
 * @property {'none'|'metadata'|'auto'} [preload] - This enumerated attribute is intended to provide a hint to the browser about what the author thinks will lead to the best user experience
 * @property {'anonymous'|'use-credentials'} [crossOrigin] - This enumerated attribute indicates whether to use CORS to fetch the related image
 * @property {string} [poster] - A URL for an image to be shown while the video is downloading (Video only)
 * @property {boolean} [playsInline] - A Boolean attribute indicating that the video is to be played "inline", that is within the element's playback area (Video only)
 */

export default createMixin({
  metadata: { id: 'media' },
  data: {
    options: {
      controls: {
        name: 'controls',
        values: {
          true: true,
          false: false
        }
      },
      autoplay: {
        name: 'autoplay',
        values: {
          true: true,
          false: false
        }
      },
      loop: {
        name: 'loop',
        values: {
          true: true,
          false: false
        }
      },
      muted: {
        name: 'muted',
        values: {
          true: true,
          false: false
        }
      },
      preload: {
        name: 'preload',
        values: {
          none: 'none',
          metadata: 'metadata',
          auto: 'auto'
        }
      },
      crossOrigin: {
        name: 'crossorigin',
        values: {
          anonymous: 'anonymous',
          'use-credentials': 'use-credentials'
        }
      },
      poster: {
        name: 'poster'
      },
      playsInline: {
        name: 'playsinline',
        values: {
          true: true,
          false: false
        }
      }
    }
  }
})
