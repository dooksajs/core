import { describe, it } from 'node:test'
import { deepStrictEqual } from 'node:assert'
import { createSchema } from '../src/index.js'

describe('Create schema', function () {
  describe('Primitives', function () {
    it('should process a type of string', function () {
      const schema = createSchema({}, {
        type: 'string'
      }, 'test/text')

      deepStrictEqual(schema, [{
        id: 'test/text',
        entry: {
          type: 'string'
        }
      }])
    })

    it('should process a type of number', function () {
      const schema = createSchema({}, {
        type: 'number'
      }, 'test/number')

      deepStrictEqual(schema, [{
        id: 'test/number',
        entry: {
          type: 'number'
        }
      }])
    })

    it('should process a type of boolean', function () {
      const schema = createSchema({}, {
        type: 'boolean'
      }, 'test/boolean')

      deepStrictEqual(schema, [{
        id: 'test/boolean',
        entry: {
          type: 'boolean'
        }
      }])
    })

    it('should handle relation option', function () {
      const schema = createSchema({}, {
        type: 'string',
        relation: 'test/primary'
      }, 'test/secondary')

      deepStrictEqual(schema, [{
        id: 'test/secondary',
        entry: {
          options: {
            relation: 'test/primary'
          },
          type: 'string'
        }
      }])
    })
  })

  describe('Object', function () {
    describe('Height of one', function () {
      describe('Options', function () {
        it('should handle required properties', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              firstName: {
                type: 'string'
              },
              lastName: {
                type: 'string'
              }
            },
            required: ['firstName']
          }, 'test/text')

          deepStrictEqual(schema, [
            {
              id: 'test/text',
              entry: {
                options: {
                  required: ['firstName']
                },
                properties: [
                  {
                    name: 'firstName',
                    type: 'string',
                    required: true
                  },
                  {
                    name: 'lastName',
                    type: 'string'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })

        it('should handle additionalProperties properties', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              firstName: {
                type: 'string'
              },
              lastName: {
                type: 'string'
              }
            },
            additionalProperties: false
          }, 'test/text')

          deepStrictEqual(schema, [
            {
              id: 'test/text',
              entry: {
                options: {
                  additionalProperties: false,
                  allowedProperties: {
                    firstName: true,
                    lastName: true
                  }
                },
                properties: [
                  {
                    name: 'firstName',
                    type: 'string'
                  },
                  {
                    name: 'lastName',
                    type: 'string'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })
      })

      describe('Patterned property', function () {
        it('should process patterned properties', function () {
          const schema = createSchema({}, {
            type: 'object',
            patternProperties: {
              '[0-9]': {
                type: 'number'
              },
              '[a-zA-Z]': {
                type: 'string'
              }
            }
          }, 'test/text')

          deepStrictEqual(schema, [
            {
              id: 'test/text',
              entry: {
                patternProperties: [
                  {
                    name: '[0-9]',
                    type: 'number'
                  },
                  {
                    name: '[a-zA-Z]',
                    type: 'string'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })

        it('should process a mix patterned properties and named properties', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              colour: {
                type: 'string'
              }
            },
            patternProperties: {
              '[0-9]': {
                type: 'number'
              },
              '[a-zA-Z]': {
                type: 'string'
              }
            }
          }, 'test/text')

          deepStrictEqual(schema, [
            {
              id: 'test/text',
              entry: {
                properties: [
                  {
                    name: 'colour',
                    type: 'string'
                  }
                ],
                patternProperties: [
                  {
                    name: '[0-9]',
                    type: 'number'
                  },
                  {
                    name: '[a-zA-Z]',
                    type: 'string'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })
      })

      describe('Primitives', function () {
        it('should process property types of string', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              firstName: {
                type: 'string'
              },
              lastName: {
                type: 'string'
              }
            }
          }, 'test/text')

          deepStrictEqual(schema, [
            {
              id: 'test/text',
              entry: {
                properties: [
                  {
                    name: 'firstName',
                    type: 'string'
                  },
                  {
                    name: 'lastName',
                    type: 'string'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })

        it('should process property types of number', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              price: {
                type: 'number'
              },
              timestamp: {
                type: 'number'
              }
            }
          }, 'test/number')

          deepStrictEqual(schema, [
            {
              id: 'test/number',
              entry: {
                properties: [
                  {
                    name: 'price',
                    type: 'number'
                  },
                  {
                    name: 'timestamp',
                    type: 'number'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })

        it('should process property types of boolean', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              isEmpty: {
                type: 'boolean'
              },
              isValid: {
                type: 'boolean'
              }
            }
          }, 'test/boolean')

          deepStrictEqual(schema, [
            {
              id: 'test/boolean',
              entry: {
                properties: [
                  {
                    name: 'isEmpty',
                    type: 'boolean'
                  },
                  {
                    name: 'isValid',
                    type: 'boolean'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })
      })

      describe('Array', function () {
        it('should process property types of array', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              products: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }, 'test/text')

          deepStrictEqual(schema, [
            {
              id: 'test/text/products/items',
              entry: {
                type: 'string'
              }
            },
            {
              id: 'test/text/products',
              entry: {
                type: 'array'
              }
            },
            {
              id: 'test/text',
              entry: {
                properties: [
                  {
                    name: 'products',
                    type: 'array'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })
      })
    })

    describe('Height of two', function () {
      describe('Patterned property', function () {
        it('should process patterned properties', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              any: {
                type: 'object',
                patternProperties: {
                  '[0-9]': {
                    type: 'number'
                  },
                  '[a-zA-Z]': {
                    type: 'string'
                  }
                }
              }
            }
          }, 'test/pattern')

          deepStrictEqual(schema, [
            {
              id: 'test/pattern/any',
              entry: {
                patternProperties: [
                  {
                    name: '[0-9]',
                    type: 'number'
                  },
                  {
                    name: '[a-zA-Z]',
                    type: 'string'
                  }
                ],
                type: 'object'
              }
            },
            {
              id: 'test/pattern',
              entry: {
                properties: [
                  {
                    name: 'any',
                    type: 'object'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })

        it('should process properties and patterned properties', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              person: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  }
                },
                patternProperties: {
                  '[0-9]': {
                    type: 'number'
                  },
                  '[a-zA-Z]': {
                    type: 'string'
                  }
                }
              }
            }
          }, 'test/pattern')

          deepStrictEqual(schema, [
            {
              id: 'test/pattern/person',
              entry: {
                properties: [
                  {
                    name: 'name',
                    type: 'string'
                  }
                ],
                patternProperties: [
                  {
                    name: '[0-9]',
                    type: 'number'
                  },
                  {
                    name: '[a-zA-Z]',
                    type: 'string'
                  }
                ],
                type: 'object'
              }
            },
            {
              id: 'test/pattern',
              entry: {
                properties: [
                  {
                    name: 'person',
                    type: 'object'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })
      })

      describe('Primitives', function () {
        it('should process property types of string', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              person: {
                type: 'object',
                properties: {
                  firstName: {
                    type: 'string'
                  },
                  lastName: {
                    type: 'string'
                  }
                }
              }
            }
          }, 'test/text')

          deepStrictEqual(schema, [
            {
              id: 'test/text/person',
              entry: {
                properties: [
                  {
                    name: 'firstName',
                    type: 'string'
                  },
                  {
                    name: 'lastName',
                    type: 'string'
                  }
                ],
                type: 'object'
              }
            },
            {
              id: 'test/text',
              entry: {
                properties: [
                  {
                    name: 'person',
                    type: 'object'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })

        it('should process property types of number', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              product: {
                type: 'object',
                properties: {
                  price: {
                    type: 'number'
                  },
                  timestamp: {
                    type: 'number'
                  }
                }
              }
            }
          }, 'test/number')

          deepStrictEqual(schema, [
            {
              id: 'test/number/product',
              entry: {
                properties: [
                  {
                    name: 'price',
                    type: 'number'
                  },
                  {
                    name: 'timestamp',
                    type: 'number'
                  }
                ],
                type: 'object'
              }
            },
            {
              id: 'test/number',
              entry: {
                properties: [
                  {
                    name: 'product',
                    type: 'object'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })

        it('should process property types of boolean', function () {
          const schema = createSchema({}, {
            type: 'object',
            properties: {
              schema: {
                type: 'object',
                properties: {
                  isEmpty: {
                    type: 'boolean'
                  },
                  isValid: {
                    type: 'boolean'
                  }
                }
              }
            }
          }, 'test/boolean')

          deepStrictEqual(schema, [
            {
              id: 'test/boolean/schema',
              entry: {
                properties: [
                  {
                    name: 'isEmpty',
                    type: 'boolean'
                  },
                  {
                    name: 'isValid',
                    type: 'boolean'
                  }
                ],
                type: 'object'
              }
            },
            {
              id: 'test/boolean',
              entry: {
                properties: [
                  {
                    name: 'schema',
                    type: 'object'
                  }
                ],
                type: 'object'
              }
            }
          ])
        })
      })
    })
  })

  describe('Array', function () {
    describe('Primitives', function () {
      it('should process a type of string', function () {
        const schema = createSchema({}, {
          type: 'array',
          items: {
            type: 'string'
          }
        }, 'test/text')

        deepStrictEqual(schema, [
          {
            id: 'test/text/items',
            entry: {
              type: 'string'
            }
          },
          {
            id: 'test/text',
            entry: {
              type: 'array'
            }
          }
        ])
      })

      it('should process a type of number', function () {
        const schema = createSchema({}, {
          type: 'array',
          items: {
            type: 'number'
          }
        }, 'test/number')

        deepStrictEqual(schema, [
          {
            id: 'test/number/items',
            entry: {
              type: 'number'
            }
          },
          {
            id: 'test/number',
            entry: {
              type: 'array'
            }
          }
        ])
      })

      it('should process a type of boolean', function () {
        const schema = createSchema({}, {
          type: 'array',
          items: {
            type: 'boolean'
          }
        }, 'test/boolean')

        deepStrictEqual(schema, [
          {
            id: 'test/boolean/items',
            entry: {
              type: 'boolean'
            }
          },
          {
            id: 'test/boolean',
            entry: {
              type: 'array'
            }
          }
        ])
      })
    })

    describe('Multidimensional', function () {
      describe('Primitives', function () {
        it('should process a type of string', function () {
          const schema = createSchema({}, {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }, 'test/text')

          deepStrictEqual(schema, [
            {
              id: 'test/text/items/items',
              entry: {
                type: 'string'
              }
            },
            {
              id: 'test/text/items',
              entry: {
                type: 'array'
              }
            },
            {
              id: 'test/text',
              entry: {
                type: 'array'
              }
            }
          ])
        })

        it('should process a type of number', function () {
          const schema = createSchema({}, {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'number'
              }
            }
          }, 'test/number')

          deepStrictEqual(schema, [
            {
              id: 'test/number/items/items',
              entry: {
                type: 'number'
              }
            },
            {
              id: 'test/number/items',
              entry: {
                type: 'array'
              }
            },
            {
              id: 'test/number',
              entry: {
                type: 'array'
              }
            }
          ])
        })

        it('should process a type of boolean', function () {
          const schema = createSchema({}, {
            type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'boolean'
              }
            }
          }, 'test/boolean')

          deepStrictEqual(schema, [
            {
              id: 'test/boolean/items/items',
              entry: {
                type: 'boolean'
              }
            },
            {
              id: 'test/boolean/items',
              entry: {
                type: 'array'
              }
            },
            {
              id: 'test/boolean',
              entry: {
                type: 'array'
              }
            }
          ])
        })
      })
    })

    describe('Options', function () {
      it('should handle unique items', function () {
        const schema = createSchema({}, {
          type: 'array',
          items: {
            type: 'string'
          },
          uniqueItems: true
        }, 'test/text')

        deepStrictEqual(schema, [
          {
            id: 'test/text/items',
            entry: {
              type: 'string'
            }
          },
          {
            id: 'test/text',
            entry: {
              options: {
                uniqueItems: true
              },
              type: 'array'
            }
          }
        ])
      })
    })
  })

  describe('Collection', function () {
    it('should create a new collection', function () {
      const schema = createSchema({}, {
        type: 'collection',
        items: {
          type: 'string'
        }
      }, 'test/collection')

      deepStrictEqual(schema, [
        {
          id: 'test/collection/items',
          entry: {
            type: 'string'
          }
        },
        {
          id: 'test/collection',
          entry: {
            type: 'collection'
          }
        }
      ])
    })
  })

  describe('ID Property Function Binding', function () {
    it('should bind defaultId function to context', function () {
      const context = { prefix: 'test-' }
      const schema = createSchema(context, {
        type: 'collection',
        defaultId: function () {
          return this.prefix + 'default'
        },
        items: {
          type: 'string'
        }
      }, 'test/collection')

      const defaultIdFunc = schema[1].entry.id.default
      deepStrictEqual(typeof defaultIdFunc, 'function')
      // @ts-ignore
      deepStrictEqual(defaultIdFunc(), 'test-default')
    })

    it('should bind prefixId function to context', function () {
      const context = { prefix: 'user-' }
      const schema = createSchema(context, {
        type: 'collection',
        prefixId: function () {
          return this.prefix
        },
        items: {
          type: 'string'
        }
      }, 'test/collection')

      const prefixIdFunc = schema[1].entry.id.prefix
      deepStrictEqual(typeof prefixIdFunc, 'function')
      // @ts-ignore
      deepStrictEqual(prefixIdFunc(), 'user-')
    })

    it('should bind suffixId function to context', function () {
      const context = { suffix: '-item' }
      const schema = createSchema(context, {
        type: 'collection',
        suffixId: function () {
          return this.suffix
        },
        items: {
          type: 'string'
        }
      }, 'test/collection')

      const suffixIdFunc = schema[1].entry.id.suffix
      deepStrictEqual(typeof suffixIdFunc, 'function')
      deepStrictEqual(suffixIdFunc(), '-item')
    })

    it('should handle all three ID properties together', function () {
      const context = { prefix: 'pre-', suffix: '-suf', defaultVal: 'def' }
      const schema = createSchema(context, {
        type: 'collection',
        defaultId: function () { return this.prefix + this.defaultVal + this.suffix },
        prefixId: function () { return this.prefix },
        suffixId: function () { return this.suffix },
        items: { type: 'string' }
      }, 'test/collection')

      const entry = schema[1].entry
      deepStrictEqual(entry.id.default(), 'pre-def-suf')
      deepStrictEqual(entry.id.prefix(), 'pre-')
      deepStrictEqual(entry.id.suffix(), '-suf')
    })
  })

  describe('Additional Properties Edge Cases', function () {
    it('should handle additionalProperties false with empty properties', function () {
      const schema = createSchema({}, {
        type: 'object',
        properties: {},
        additionalProperties: false
      }, 'test/empty')

      deepStrictEqual(schema, [{
        id: 'test/empty',
        entry: {
          options: {
            additionalProperties: false,
            allowedProperties: {}
          },
          type: 'object'
        }
      }])
    })

    it('should handle additionalProperties false with pattern properties only', function () {
      const schema = createSchema({}, {
        type: 'object',
        patternProperties: {
          '[0-9]+': { type: 'number' }
        },
        additionalProperties: false
      }, 'test/pattern-only')

      deepStrictEqual(schema, [{
        id: 'test/pattern-only',
        entry: {
          options: {
            additionalProperties: false,
            allowedProperties: {}
          },
          patternProperties: [
            {
              name: '[0-9]+',
              type: 'number'
            }
          ],
          type: 'object'
        }
      }])
    })

    it('should handle default function binding', function () {
      const context = { value: 'default-value' }
      const schema = createSchema(context, {
        type: 'string',
        default: function () {
          return this.value
        }
      }, 'test/default')

      const defaultFunc = schema[0].entry.options.default
      deepStrictEqual(typeof defaultFunc, 'function')
      deepStrictEqual(defaultFunc(), 'default-value')
    })
  })

  describe('Complex Nested Structures', function () {
    it('should handle deeply nested arrays (3+ levels)', function () {
      const schema = createSchema({}, {
        type: 'array',
        items: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }, 'test/deep-array')

      deepStrictEqual(schema, [
        {
          id: 'test/deep-array/items/items/items',
          entry: { type: 'string' }
        },
        {
          id: 'test/deep-array/items/items',
          entry: { type: 'array' }
        },
        {
          id: 'test/deep-array/items',
          entry: { type: 'array' }
        },
        {
          id: 'test/deep-array',
          entry: { type: 'array' }
        }
      ])
    })

    it('should handle arrays of objects with complex properties', function () {
      const schema = createSchema({}, {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            scores: {
              type: 'array',
              items: { type: 'number' }
            }
          }
        }
      }, 'test/complex-array')

      deepStrictEqual(schema, [
        {
          id: 'test/complex-array/items/scores/items',
          entry: { type: 'number' }
        },
        {
          id: 'test/complex-array/items/scores',
          entry: { type: 'array' }
        },
        {
          id: 'test/complex-array/items',
          entry: {
            properties: [
              { name: 'name', type: 'string' },
              { name: 'scores', type: 'array' }
            ],
            type: 'object'
          }
        },
        {
          id: 'test/complex-array',
          entry: { type: 'array' }
        }
      ])
    })

    it('should handle objects with nested objects and pattern properties', function () {
      const schema = createSchema({}, {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' }
            },
            patternProperties: {
              '[a-z]+': { type: 'boolean' }
            }
          }
        }
      }, 'test/nested-pattern')

      deepStrictEqual(schema, [
        {
          id: 'test/nested-pattern/data',
          entry: {
            properties: [
              { name: 'id', type: 'string' }
            ],
            patternProperties: [
              { name: '[a-z]+', type: 'boolean' }
            ],
            type: 'object'
          }
        },
        {
          id: 'test/nested-pattern',
          entry: {
            properties: [
              { name: 'data', type: 'object' }
            ],
            type: 'object'
          }
        }
      ])
    })
  })

  describe('Edge Cases and Error Conditions', function () {
    it('should handle empty properties object', function () {
      const schema = createSchema({}, {
        type: 'object',
        properties: {}
      }, 'test/empty-props')

      deepStrictEqual(schema, [{
        id: 'test/empty-props',
        entry: {
          type: 'object'
        }
      }])
    })

    it('should handle empty patternProperties object', function () {
      const schema = createSchema({}, {
        type: 'object',
        patternProperties: {}
      }, 'test/empty-pattern')

      deepStrictEqual(schema, [{
        id: 'test/empty-pattern',
        entry: {
          type: 'object'
        }
      }])
    })

    it('should handle schema with only type', function () {
      const schema = createSchema({}, {
        type: 'string'
      }, 'test/type-only')

      deepStrictEqual(schema, [{
        id: 'test/type-only',
        entry: {
          type: 'string'
        }
      }])
    })

    it('should handle collection with empty items', function () {
      const schema = createSchema({}, {
        type: 'collection',
        items: {}
      }, 'test/collection-empty')

      deepStrictEqual(schema, [
        {
          id: 'test/collection-empty/items',
          entry: { type: undefined }
        },
        {
          id: 'test/collection-empty',
          entry: { type: 'collection' }
        }
      ])
    })

    it('should handle mixed required and optional properties', function () {
      const schema = createSchema({}, {
        type: 'object',
        properties: {
          required1: { type: 'string' },
          optional1: { type: 'number' },
          required2: { type: 'boolean' }
        },
        required: ['required1', 'required2']
      }, 'test/mixed-required')

      deepStrictEqual(schema, [{
        id: 'test/mixed-required',
        entry: {
          options: {
            required: ['required1', 'required2']
          },
          properties: [
            { name: 'required1', type: 'string', required: true },
            { name: 'optional1', type: 'number' },
            { name: 'required2', type: 'boolean', required: true }
          ],
          type: 'object'
        }
      }])
    })

    it('should handle array with uniqueItems and other options', function () {
      const schema = createSchema({}, {
        type: 'array',
        items: { type: 'string' },
        uniqueItems: true,
        maxItems: 10,
        minItems: 1
      }, 'test/array-options')

      deepStrictEqual(schema, [
        {
          id: 'test/array-options/items',
          entry: { type: 'string' }
        },
        {
          id: 'test/array-options',
          entry: {
            options: {
              uniqueItems: true,
              maxItems: 10,
              minItems: 1
            },
            type: 'array'
          }
        }
      ])
    })
  })

  describe('Recursion and Stack Depth', function () {
    it('should handle very deep nesting without stack overflow', function () {
      let deepSchema = { type: 'string' }
      for (let i = 0; i < 10; i++) {
        deepSchema = {
          type: 'array',
          items: deepSchema
        }
      }

      const schema = createSchema({}, deepSchema, 'test/deep')
      
      deepStrictEqual(schema.length, 11)
      deepStrictEqual(schema[0].entry.type, 'string')
      deepStrictEqual(schema[1].entry.type, 'array')
      deepStrictEqual(schema[10].entry.type, 'array')
    })
  })
})
