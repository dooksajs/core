import { describe, it, beforeEach } from 'node:test'
import { deepStrictEqual, notStrictEqual, strictEqual } from 'node:assert'
import { mockState } from '#mock'

describe('State', function () {
  /** @type {import('../../src/client/state.js').state} */
  let state

  describe('Setup', function () {
    beforeEach(async function () {
      state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'collection',
              items: {
                type: 'string'
              }
            }
          }
        }
      }])
    })

    it('should add schema', function () {
      deepStrictEqual(state.stateGetSchema('test/items'), {
        type: 'collection'
      })
      deepStrictEqual(state.stateGetSchema('test/items/items'), {
        type: 'string'
      })
    })

    it('should add schema names to data/collections', function () {
      deepStrictEqual(state.stateGetValue({
        name: 'data/collections'
      }).item, ['test/items'])
    })
  })

  describe('UnsafeSetValue', function () {
    it('should set value regardless of type', async function () {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])

      state.stateUnsafeSetValue({
        name: 'test/items',
        value: 123
      })

      strictEqual(state.stateGetValue({
        name: 'test/items'
      }).item, 123)
    })
    it('should set value by ID regardless of type', async function () {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'collection',
              items: {
                type: 'string'
              }
            }
          }
        }
      }])

      const item = state.stateUnsafeSetValue({
        name: 'test/items',
        value: 123,
        options: {
          id: 'test'
        }
      })

      strictEqual(state.stateGetValue({
        name: 'test/items',
        id: item.id
      }).item, 123)
    })

    it('should set value should dispatch "update" listener once', async function (t) {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])
      const mockHandler = t.mock.fn(function (data) {
        return data
      })

      state.stateAddListener({
        name: 'test/items',
        on: 'update',
        handler: mockHandler
      })

      state.stateUnsafeSetValue({
        name: 'test/items',
        value: 123
      })

      strictEqual(mockHandler.mock.callCount(), 1)
    })

    it('should set value should dispatch "update" listener zero times', async function (t) {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])
      const mockHandler = t.mock.fn(function () {
      })

      state.stateAddListener({
        name: 'test/items',
        on: 'update',
        handler: mockHandler
      })

      state.stateUnsafeSetValue({
        name: 'test/items',
        value: 123,
        options: {
          stopPropagation: true
        }
      })

      strictEqual(mockHandler.mock.callCount(), 0)
    })

    it('should fail with an undefined option id property', async function () {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])

      try {
        state.stateUnsafeSetValue({
          name: 'test/items',
          value: 123,
          options: {
            id: null
          }
        })
      } catch (error) {
        strictEqual(error.message, 'UnsafeSetValue unexpected id type found "null"')
      }
    })
  })

  describe('SetValue', function () {
    it('should fail if no schema is found', async function () {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])

      try {
        state.stateSetValue({
          name: 'schema/notFound',
          value: 123
        })
      } catch (error) {
        strictEqual(error.message, 'Schema not found')
      }
    })

    it('should fail if no value is provided', async function () {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])

      try {
        state.stateSetValue({
          name: 'test/items',
          value: null
        })
      } catch (error) {
        strictEqual(error.schemaPath, 'test/items')
        strictEqual(error.message, 'Source was undefined')
      }
    })

    describe('String', function () {
      it('should successfully set a string value', async function () {
        const state = await mockState([{
          name: 'test',
          state: {
            schema: {
              items: {
                type: 'string'
              }
            }
          }
        }])

        state.stateSetValue({
          name: 'test/items',
          value: 'hello world'
        })

        strictEqual(state.stateGetValue({
          name: 'test/items'
        }).item, 'hello world')
      })

      it('should fail to set a non string value', async function () {
        const state = await mockState([{
          name: 'test',
          state: {
            schema: {
              items: {
                type: 'string'
              }
            }
          }
        }])

        try {
          state.stateSetValue({
            name: 'test/items',
            value: 1
          })
        } catch (error) {
          strictEqual(error.schemaPath, 'test/items')
          strictEqual(error.message, 'Unexpected type, expected "string" but got "number"')
        }
      })
    })

    describe('Number', function () {
      it('should successfully set a number value', async function () {
        const state = await mockState([{
          name: 'test',
          state: {
            schema: {
              items: {
                type: 'number'
              }
            }
          }
        }])

        state.stateSetValue({
          name: 'test/items',
          value: 1
        })

        strictEqual(state.stateGetValue({
          name: 'test/items'
        }).item, 1)
      })

      it('should fail to set a non number value', async function () {
        const state = await mockState([{
          name: 'test',
          state: {
            schema: {
              items: {
                type: 'number'
              }
            }
          }
        }])

        try {
          state.stateSetValue({
            name: 'test/items',
            value: '1'
          })
        } catch (error) {
          strictEqual(error.message, 'Unexpected type, expected "number" but got "string"')
        }
      })
    })

    describe('Object', function () {
      it('should successfully set object', async function () {
        const state = await mockState([{
          name: 'test',
          state: {
            schema: {
              items: {
                type: 'object'
              }
            }
          }
        }])

        state.stateSetValue({
          name: 'test/items',
          value: {
            red: 'world'
          }
        })

        deepStrictEqual(
          state.stateGetValue({ name: 'test/items' }).item,
          {
            red: 'world'
          }
        )
      })

      it('should fail to set a non object value', async function () {
        const state = await mockState([{
          name: 'test',
          state: {
            schema: {
              items: {
                type: 'object'
              }
            }
          }
        }])

        try {
          state.stateSetValue({
            name: 'test/items',
            value: []
          })
        } catch (error) {
          strictEqual(error.schemaPath, 'test/items')
          strictEqual(error.message, 'Unexpected type, expected "object" but got "array"')
        }
      })

      it('should successfully to set an object with properties', async function () {
        const state = await mockState([{
          name: 'test',
          state: {
            schema: {
              items: {
                type: 'object',
                properties: {
                  colour: {
                    type: 'string'
                  },
                  age: {
                    type: 'number'
                  }
                }
              }
            }
          }
        }])

        state.stateSetValue({
          name: 'test/items',
          value: {
            colour: 'red',
            age: 42
          }
        })

        deepStrictEqual(
          state.stateGetValue({ name: 'test/items' }).item,
          {
            colour: 'red',
            age: 42
          }
        )
      })

      it('should successfully to set nested object with properties', async function () {
        const state = await mockState([{
          name: 'test',
          state: {
            schema: {
              items: {
                type: 'object',
                properties: {
                  person: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string'
                      },
                      fruits: {
                        type: 'object',
                        properties: {
                          apples: {
                            type: 'boolean'
                          },
                          banana: {
                            type: 'boolean'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }])

        state.stateSetValue({
          name: 'test/items',
          value: {
            person: {
              name: 'Jack',
              fruits: {
                apples: true,
                banana: false
              }
            }
          }
        })

        deepStrictEqual(
          state.stateGetValue({ name: 'test/items' }).item,
          {
            person: {
              name: 'Jack',
              fruits: {
                apples: true,
                banana: false
              }
            }
          }
        )
      })

      it('should fail to set an invalid nested property', async function () {
        const state = await mockState([{
          name: 'test',
          state: {
            schema: {
              items: {
                type: 'object',
                properties: {
                  person: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string'
                      },
                      fruits: {
                        type: 'object',
                        properties: {
                          apples: {
                            type: 'boolean'
                          },
                          banana: {
                            type: 'boolean'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }])

        try {
          state.stateSetValue({
            name: 'test/items',
            value: {
              person: {
                name: 'Jack',
                fruits: {
                  apples: 'true',
                  banana: false
                }
              }
            }
          })
        } catch (error) {
          strictEqual(error.schemaPath, 'test/items/person/fruits')
          strictEqual(error.message, 'Unexpected type, expected "boolean" but got "string"')
        }
      })

      describe('Patterned properties', function () {
        it('should successfully to set an object with properties', async function () {
          const state = await mockState([{
            name: 'test',
            state: {
              schema: {
                items: {
                  type: 'object',
                  patternProperties: {
                    '[a-z]': {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }])

          state.stateSetValue({
            name: 'test/items',
            value: {
              colour: 'red',
              age: '42'
            }
          })

          deepStrictEqual(
            state.stateGetValue({ name: 'test/items' }).item,
            {
              colour: 'red',
              age: '42'
            }
          )
        })

        it('should successfully to set nested object with properties', async function () {
          const state = await mockState([{
            name: 'test',
            state: {
              schema: {
                items: {
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
                        '[A-Z]': {
                          type: 'object',
                          properties: {
                            apples: {
                              type: 'boolean'
                            },
                            banana: {
                              type: 'boolean'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }])

          state.stateSetValue({
            name: 'test/items',
            value: {
              person: {
                name: 'Jack',
                FRUITS: {
                  apples: true,
                  banana: false
                }
              }
            }
          })

          deepStrictEqual(
            state.stateGetValue({ name: 'test/items' }).item,
            {
              person: {
                name: 'Jack',
                FRUITS: {
                  apples: true,
                  banana: false
                }
              }
            }
          )
        })

        it('should fail to set an invalid nested property', async function () {
          const state = await mockState([{
            name: 'test',
            state: {
              schema: {
                items: {
                  type: 'object',
                  properties: {
                    person: {
                      type: 'object',
                      patternProperties: {
                        '[A-Z]': {
                          type: 'object',
                          properties: {
                            apples: {
                              type: 'boolean'
                            },
                            banana: {
                              type: 'boolean'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }])

          let catchError = false
          try {
            state.stateSetValue({
              name: 'test/items',
              value: {
                person: {
                  FRUITS: {
                    apples: 'true',
                    banana: false
                  }
                }
              }
            })
          } catch (error) {
            catchError = true
            strictEqual(error.schemaPath, 'test/items/person/[A-Z]')
            strictEqual(error.message, 'Unexpected type, expected "boolean" but got "string"')
          } finally {
            strictEqual(catchError, true)
          }
        })
      })

      describe('Options', function () {
        it('should merge primitive property with target', async function () {
          const state = await mockState([{
            name: 'test',
            state: {
              schema: {
                items: {
                  type: 'object',
                  properties: {
                    colour: {
                      type: 'string'
                    },
                    age: {
                      type: 'number'
                    }
                  }
                }
              }
            }
          }])

          state.stateSetValue({
            name: 'test/items',
            value: {
              colour: 'red',
              age: 42
            }
          })


          state.stateSetValue({
            name: 'test/items',
            value: {
              colour: 'blue'
            },
            options: {
              merge: true
            }
          })

          deepStrictEqual(
            state.stateGetValue({ name: 'test/items' }).item,
            {
              colour: 'blue',
              age: 42
            }
          )
        })

        it('should merge primitive property with empty target', async function () {
          const state = await mockState([{
            name: 'test',
            state: {
              schema: {
                items: {
                  type: 'object',
                  properties: {
                    colour: {
                      type: 'string'
                    },
                    age: {
                      type: 'number'
                    }
                  }
                }
              }
            }
          }])


          state.stateSetValue({
            name: 'test/items',
            value: {
              colour: 'blue'
            },
            options: {
              merge: true
            }
          })

          deepStrictEqual(
            state.stateGetValue({ name: 'test/items' }).item,
            {
              colour: 'blue'
            }
          )
        })

        it('should merge object property with target', async function () {
          const state = await mockState([{
            name: 'test',
            state: {
              schema: {
                items: {
                  type: 'object',
                  properties: {
                    person: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string'
                        },
                        age: {
                          type: 'number'
                        }
                      }
                    }
                  }
                }
              }
            }
          }])

          state.stateSetValue({
            name: 'test/items',
            value: {
              person: {
                name: 'Jack',
                age: 42
              }
            }
          })

          state.stateSetValue({
            name: 'test/items',
            value: {
              person: {
                age: 32
              }
            },
            options: {
              merge: true
            }
          })

          const result = state.stateGetValue({ name: 'test/items' })

          deepStrictEqual(
            result.item,
            {
              person: {
                name: 'Jack',
                age: 32
              }
            }
          )
        })

        it('should fail when not providing a required property', async function () {
          const state = await mockState([{
            name: 'test',
            state: {
              schema: {
                items: {
                  type: 'object',
                  properties: {
                    colour: {
                      type: 'string'
                    },
                    age: {
                      type: 'number'
                    }
                  },
                  required: ['colour']
                }
              }
            }
          }])

          try {
            state.stateSetValue({
              name: 'test/items',
              value: {
                age: 42
              }
            })
          } catch (error) {
            strictEqual(error.message, 'Invalid data (test/items): required property missing: "colour"')
          }
        })
      })
    })
  })
})
