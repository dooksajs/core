import createPlugin from '@dooksa/create-plugin'

export const kitchenSinkSchema = {
  collection: {
    type: 'collection',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        status: { type: 'string' },
        role: { type: 'string' },
        age: { type: 'number' },
        relatedId: { type: 'string' }
      }
    }
  },
  single: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      value: { type: 'number' }
    }
  },
  array: {
    type: 'array',
    items: {
      type: 'string'
    }
  },
  complex: {
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          profile: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
              settings: {
                type: 'object',
                properties: {
                  theme: { type: 'string' },
                  notifications: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  },
  related: {
    type: 'collection',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        refId: { type: 'string' }
      }
    }
  },
  products: {
    type: 'collection',
    items: {
      type: 'string'
    }
  },
  user: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      age: { type: 'number' },
      tags: {
        type: 'array',
        items: { type: 'string' },
        uniqueItems: true,
        minItems: 2,
        maxItems: 3
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'pending']
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        },
        uniqueItems: true
      }
    },
    required: ['name', 'email'],
    additionalProperties: false,
    patternProperties: {
      '^[a-zA-Z_]+$': { type: 'string' }
    }
  }
}

export const userSchema = {
  profiles: {
    type: 'collection',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        settings: {
          type: 'string',
          relation: 'user/settings'
        }
      }
    }
  },
  settings: {
    type: 'collection',
    items: {
      type: 'object',
      properties: {
        theme: { type: 'string' }
      }
    }
  }
}

/**
 * Returns a list of plugins for testing, including a 'test' plugin with a kitchen sink schema
 * and a 'user' plugin with a user profile schema.
 *
 * @param {Array} [additionalPlugins=[]] - Additional plugins to include
 * @returns {Array} List of plugin instances
 */
export function getTestPlugins (additionalPlugins = []) {
  const plugins = [
    createPlugin('test', {
      state: {
        schema: kitchenSinkSchema
      }
    }),
    createPlugin('user', {
      state: {
        schema: userSchema
      }
    })
  ]

  if (additionalPlugins.length) {
    plugins.push(...additionalPlugins)
  }

  return plugins
}
