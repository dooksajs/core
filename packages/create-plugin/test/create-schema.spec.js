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
})
