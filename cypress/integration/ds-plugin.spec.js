/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */
import DsPlugin from '@dooksa/ds-plugin'
import dsOperators from '../../src'
const plugin = new DsPlugin(dsOperators)
const methods = plugin.methods
beforeEach(() => {
  cy.on('uncaught:exception', (e, runnable) => {
    console.log('error: ', e)
    console.log('runnable: ', runnable)
  })
})
describe('Setup', function () {
  it('Initialise', function () {
    expect(plugin.init()).to.be.undefined
  })
})

describe('Eval equal', function () {
  it('can return true if the operands are equal.', function () {
    expect(methods.eval({
      name: '==',
      values: [1, 1]
    })).to.be.true
  })

  it('can return false if the operands are of different type.', function () {
    expect(methods.eval({
      name: '==',
      values: [1, '1']
    })).to.be.false
  })
})

describe('Eval not equal', function () {
  it('can return true if the operands are not equal.', function () {
    expect(methods.eval({
      name: '!=',
      values: [1, 2]
    })).to.be.true
  })

  it('can return true if the operands are of different type.', function () {
    expect(methods.eval({
      name: '!=',
      values: [1, '1']
    })).to.be.true
  })
})

describe('Eval greater than', function () {
  it('can return true if the first operand is greater than the second operand.', function () {
    expect(methods.eval({
      name: '>',
      values: [2, 1]
    })).to.be.true
  })

  it('can return false if the first operand is less than the second operand.', function () {
    expect(methods.eval({
      name: '>',
      values: [1, 2]
    })).to.be.false
  })

  it('can return false if the first operand is equal to the second operand.', function () {
    expect(methods.eval({
      name: '>',
      values: [1, 1]
    })).to.be.false
  })
})

describe('Eval greater than or equal', function () {
  it('can return true if the first operand is greater than the second operand.', function () {
    expect(methods.eval({
      name: '>=',
      values: [2, 1]
    })).to.be.true
  })

  it('can return false if the first operand is less than the second operand.', function () {
    expect(methods.eval({
      name: '>=',
      values: [1, 2]
    })).to.be.false
  })

  it('can return true if the first operand is equal to the second operand.', function () {
    expect(methods.eval({
      name: '>=',
      values: [1, 1]
    })).to.be.true
  })
})

describe('Eval less than', function () {
  it('can return true if the first operand is less than the second operand.', function () {
    expect(methods.eval({
      name: '<',
      values: [1, 2]
    })).to.be.true
  })

  it('can return false if the first operand is greater than the second operand.', function () {
    expect(methods.eval({
      name: '<',
      values: [2, 1]
    })).to.be.false
  })

  it('can return false if the first operand is equal to the second operand.', function () {
    expect(methods.eval({
      name: '<',
      values: [1, 1]
    })).to.be.false
  })
})

describe('Eval less than or equal', function () {
  it('can return true if the first operand is less than the second operand.', function () {
    expect(methods.eval({
      name: '<=',
      values: [1, 2]
    })).to.be.true
  })

  it('can return false if the first operand is greater than the second operand.', function () {
    expect(methods.eval({
      name: '<=',
      values: [2, 1]
    })).to.be.false
  })

  it('can return true if the first operand is equal to the second operand.', function () {
    expect(methods.eval({
      name: '<=',
      values: [1, 1]
    })).to.be.true
  })
})

describe('Eval remainder', function () {
  it('can return 0 if the first operand is a multiple of the second operand.', function () {
    expect(methods.eval({
      name: '%',
      values: [6, 2]
    })).to.equal(0)
  })

  it('can return 0 if the first operand, expressed as a string, is a multiple of the second operand.', function () {
    expect(methods.eval({
      name: '%',
      values: ['6', 2]
    })).to.equal(0)
  })

  it('can return NaN if the first operand is expressed as a non-numeric string.', function () {
    assert.isNaN(methods.eval({
      name: '%',
      values: ['six', 2]
    }), 'NaN is NaN')
  })

  it('can return 2 if the first operand is equal to a multiple of the second operand plus 2.', function () {
    expect(methods.eval({
      name: '%',
      values: [14, 4]
    })).to.equal(2)
  })
})

describe('Eval increment', function () {
  it('postfix operator can return the operand', function () {
    expect(methods.eval({
      name: 'x++',
      values: [1]
    })).to.equal(1)
  })

  it('prefix operator can return a number 1 greater than the operand', function () {
    expect(methods.eval({
      name: '++x',
      values: [1]
    })).to.equal(2)
  })

  it('prefix operator can return a number 1 greater than the rounded float operand', function () {
    expect(methods.eval({
      name: '++x',
      values: [1e-34]
    })).to.equal(1)
  })

  it('prefix operator can return a number 1 greater than the numeric string operand', function () {
    expect(methods.eval({
      name: '++x',
      values: ['1']
    })).to.equal(2)
  })

  it('prefix operator can return NaN for a non-numeric string operand', function () {
    assert.isNaN(methods.eval({
      name: '++x',
      values: ['one']
    }), 'NaN is NaN')
  })
})

describe('Eval decrement', function () {
  it('postfix operator can return the operand', function () {
    expect(methods.eval({
      name: 'x--',
      values: [1]
    })).to.equal(1)
  })

  it('prefix operator can return a number 1 less than the operand', function () {
    expect(methods.eval({
      name: '--x',
      values: [1]
    })).to.equal(0)
  })

  it('prefix operator can return a number 1 less than the rounded float operand', function () {
    expect(methods.eval({
      name: '--x',
      values: [1e-34]
    })).to.equal(-1)
  })

  it('prefix operator can return a number 1 less than the numeric string operand', function () {
    expect(methods.eval({
      name: '--x',
      values: ['1']
    })).to.equal(0)
  })

  it('prefix operator can return NaN for a non-numeric string operand', function () {
    assert.isNaN(methods.eval({
      name: '--x',
      values: ['one']
    }), 'NaN is NaN')
  })
})

describe('Eval exponentiation', function () {
  it('operator can return the first operand to the power of the second ', function () {
    expect(methods.eval({
      name: '**',
      values: [2, 3]
    })).to.equal(8)
  })

  it('operator can return a valid number  from a small float operand and small positive integer second', function () {
    expect(methods.eval({
      name: '**',
      values: [1e-34, 4]
    })).to.equal(9.999999999999998e-137)
  })

  it('operator can return a number with at least one numeric string operand', function () {
    expect(methods.eval({
      name: '**',
      values: ['2', 4]
    })).to.equal(16)
  })

  it('operator can return NaN for a non-numeric string operand', function () {
    assert.isNaN(methods.eval({
      name: '--x',
      values: ['two', 4]
    }), 'NaN is NaN')
  })
})

describe('Eval addition', function () {
  it('can return a number if the operands are numbers.', function () {
    expect(methods.eval({
      name: '+',
      values: [1, 2]
    })).to.equal(3)
  })

  it('can return a string concatenation if the operands are numbers that may be expressed as a string.', function () {
    expect(methods.eval({
      name: '+',
      values: ['1', 2]
    })).to.equal('12')
  })
})

describe('Eval subtraction', function () {
  it('can return a number if the operands are numbers.', function () {
    expect(methods.eval({
      name: '-',
      values: [1, 2]
    })).to.equal(-1)
  })

  it('can return a number if the operands are numbers that may be expressed as a string.', function () {
    expect(methods.eval({
      name: '-',
      values: ['1', 2]
    })).to.equal(-1)
  })
})

describe('Eval subtraction', function () {
  it('can return a number if the operands are numbers.', function () {
    expect(methods.eval({
      name: '-',
      values: [1, 2]
    })).to.equal(-1)
  })

  it('can return a number if the operands are numbers that may be expressed as a string.', function () {
    expect(methods.eval({
      name: '-',
      values: ['1', 2]
    })).to.equal(-1)
  })
})

describe('Eval multiplication', function () {
  it('can return a number if the operands are numbers.', function () {
    expect(methods.eval({
      name: '*',
      values: [2, 3]
    })).to.equal(6)
  })

  it('can return a number if the operands are numbers that may be expressed as a string.', function () {
    expect(methods.eval({
      name: '*',
      values: ['2', 3]
    })).to.equal(6)
  })
})

describe('Eval logical NOT', function () {
  it('can return true if the operand is falsey', function () {
    expect(methods.eval({
      name: '!',
      values: []
    })).to.equal(true)
  })

  it('can return false if the operator expression is true', function () {
    expect(methods.eval({
      name: '!',
      values: ['3 > 2']
    })).to.equal(false)
  })
})

describe('Eval logical NOT NOT', function () {
  it('can return false if the operand is falsey.', function () {
    expect(methods.eval({
      name: '!!',
      values: []
    })).to.equal(false)
  })

  it('can return true if the operator expression is true', function () {
    expect(methods.eval({
      name: '!!',
      values: ['3 > 2']
    })).to.equal(true)
  })

  it('can return false if the operator expression is false', function () {
    expect(methods.eval({
      name: '!!',
      values: ['3 === 2']
    })).to.equal(true)
  })
})

describe('tests for arrayFindByKeyValue', function () {
  it('can find a string in an object with a single element',
    function () {
      expect(methods.arrayFindByKeyValue({
        list:
      [
        {
          a: 'stuff'
        }
      ],
        key: 'a',
        valueIndex: ['stuff', 0]
      })
      ).to.eql([0, 0])
    })

  it('can find a string in an object with embed similar elements',
    function () {
      expect(methods.arrayFindByKeyValue({
        list:
      [
        {
          a: 'stuff'
        },
        {
          x: {
            a: 'stuff'
          }
        }
      ],
        key: 'a',
        valueIndex: ['stuff', 0]
      })
      ).to.eql([0, 0])
    })

  it('can find the first element of an array, with the second element matching having and embedded matching object', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff'
        },
        {
          x: {
            a: 'stuff'
          }
        }
      ],
      key: 'a',
      valueIndex: ['stuff', 0]
    })
    ).to.eql([0, 0])
  })

  it('fails to find a non-exisitent object', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff'
        }
      ],
      key: 'x',
      valueIndex: ['stuff', 0]
    })
    ).to.be.undefined
  })

  it('finds the second object in the array', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'otherstuff'
        },
        {
          a: 'stuff'
        }
      ],
      key: 'a',
      valueIndex: ['stuff', 0]
    })
    ).to.eql([1, 1])
  })

  it('finds the second object in the array, starting the search from the second object', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'otherstuff'
        },
        {
          a: 'stuff'
        }
      ],
      key: 'a',
      valueIndex: ['stuff', 1]
    })
    ).to.eql([1, 1])
  })

  it('finds second object in the first object', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff',
          x: 'otherstuff'
        }
      ],
      key: 'x',
      valueIndex: ['otherstuff', 0]
    })
    ).to.eql([0, 0])
  })

  it('fails to find second object in first object when only the key matches', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff',
          x: 'otherstuff'
        }
      ],
      key: 'x',
      valueIndex: ['fluffybunnies', 0]
    })
    ).to.be.undefined
  })

  it('finds second object in first object snd sdecond object when it also exists in second object of the second object', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff'
        }
      ],
      key: 'x',
      valueIndex: ['otherstuff', 0]
    })
    ).to.eql([0, 1])
  })

  it('starting the search from the first object, finds the first object of the second and third objects ', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff'
        }
      ],
      key: 'a',
      valueIndex: ['stuff', 1]
    })
    ).to.eql([0, 2])
  })

  it('WHY did it not find ONLY the first object of the second object?', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          x: 'otherstuff'
        },
        {
          a: 'stuff'
        }
      ],
      key: 'a',
      valueIndex: ['stuff', 1]
    })
    ).to.eql([1, 1])
  })

  it('starting at the third object, find the first object of the fourth object', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          x: 'otherstuff'
        },
        {
          a: 'stuff'
        }
      ],
      key: 'a',
      valueIndex: ['stuff', 2]
    })
    ).to.eql([3, 3])
  })

  it('fails to find a non-existent KV pair', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        }
      ],
      key: 'a',
      valueIndex: ['otherstuff', 0]
    })
    ).to.eq(undefined)
  })

  it('find an instance of KV in each object in the array', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        }
      ],
      key: 'a',
      valueIndex: ['stuff', 0]
    })
    ).to.eql([0, 2])
  })

  it('WHY does this find all instances of the KV pair, when the search starts at the last object?', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        }
      ],
      key: 'a',
      valueIndex: ['stuff', 2]
    })
    ).to.eql([2, 2])
  })

  it('WHY does this find all instances of the KV pair, when the search starts at the second object?', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        }
      ],
      key: 'a',
      valueIndex: ['stuff', 1]
    })
    ).to.eql([0, 2])
  })

  it('does not find a second-level object that matches the KV as it is an unexpected structure', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: {
            a: 'stuff',
            x: 'otherstuff'
          }
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        }
      ],
      key: 'x',
      valueIndex: ['otherstuff', 0]
    })
    ).to.eql([1, 1])
  })

  it('does not find a KV match at second level of first and third objects. Does find a match with the second object', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: {
            a: 'stuff',
            x: 'otherstuff'
          }
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: {
            a: 'stuff',
            x: 'otherstuff'
          }
        }
      ],
      key: 'x',
      valueIndex: ['otherstuff', 0]
    })
    ).to.eql([1, 1])
  })

  it('should not find a non-existent KV pair, when key and values exist separately across the objects', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: {
            a: 'stuff',
            x: 'otherstuff'
          }
        },
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
          a: {
            a: 'stuff',
            x: 'otherstuff'
          }
        }
      ],
      key: 'a',
      valueIndex: ['otherstuff', 0]
    })
    ).to.be.undefined
  })

  it('search handles and empty second object', function () {
    expect(methods.arrayFindByKeyValue({
      list:
      [
        {
          a: 'stuff',
          x: 'otherstuff'
        },
        {
        }
      ],
      key: 'x',
      valueIndex: ['otherstuff', 0]
    })
    ).to.eql([0, 0])
  })
})

describe('tests for arrayRemove', function () {
  it('can not remove the contents of an index that does not exist',
    function () {
      expect(methods.arrayRemove({
        list:
      [
        1
      ],
        items: [
          4
        ]
      })
      ).to.eql([1])
    })
  it('removes an object for which an array entry exists',
    function () {
      expect(methods.arrayRemove({
        list:
      [
        1
      ],
        items: [
          0
        ]
      })
      ).to.eql([])
    })
  it('removes an the first and last object from an array lenghth > 2',
    function () {
      expect(methods.arrayRemove({
        list:
      [
        'a',
        'b',
        'c'
      ],
        items: [
          0,
          2
        ]
      })
      ).to.eql(['b'])
    })
})

describe('tests for arrayPrevKeyValue', function () {
  it('fail to find a previous key',
    function () {
      expect(methods.arrayPrevKeyValue({
        list:
      [
        { a: 'stuff' }
      ],
        key: '4'
      })
      ).to.eql([undefined, 0])
    })

  it('what happens if there is only one match and it is after the list indexs object (default 0)',
    function () {
      expect(methods.arrayPrevKeyValue({
        list:
      [
        { b: 'stuff' },
        { a: 'stuff' }
      ],
        key: 'a'
      })
      ).to.eql([undefined, 0])
    })

  it('does not return the KV previous to the key entry',
    function () {
      expect(methods.arrayPrevKeyValue({
        list:
      [
        { b: 'otherstuff' },
        { a: 'stuff' }
      ],
        key: 'a',
        index: 1
      })
      ).to.eql([undefined, 0])
    })

  it('returns the value for the key previous to the start of the starting index',
    function () {
      expect(methods.arrayPrevKeyValue({
        list:
      [
        { b: 'otherstuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 1
      })
      ).to.eql(['otherstuff', 0])
    })

  it('returns the value for the key matching the start of the starting index',
    function () {
      expect(methods.arrayPrevKeyValue({
        list:
      [
        { b: 'otherstuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 0
      })
      ).to.eql(['otherstuff', 0])
    })
  it('returns the value for the key matching the start of the starting index',
    function () {
      expect(methods.arrayPrevKeyValue({
        list:
      [
        { b: 'stuff' },
        { b: 'otherstuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 2
      })
      ).to.eql(['otherstuff', 1])
    })
  it('returns the value for the key matching the start of the starting index',
    function () {
      expect(methods.arrayPrevKeyValue({
        list:
      [
        { b: 'stuff' },
        { b: 'stuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 1
      })
      ).to.eql(['stuff', 1])
    })
  it('returns the value and the index of the object for the key matching before the starting index 1',
    function () {
      expect(methods.arrayPrevKeyValue({
        list:
      [
        { b: 'otherstuff' },
        { c: 'stuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 1
      })
      ).to.eql(['otherstuff', 0])
    })
  it('returns the value and the index of the object for the key matching before the starting index 2',
    function () {
      expect(methods.arrayPrevKeyValue({
        list:
      [
        { b: 'otherstuff' },
        { c: 'stuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 2
      })
      ).to.eql(['otherstuff', 0])
    })
})

describe('tests for arrayNextKeyValue', function () {
  it('fail to find a next key',
    function () {
      expect(methods.arrayNextKeyValue({
        list:
      [
        { a: 'stuff' }
      ],
        key: '4'
      })
      ).to.eql([undefined, 0])
    })

  it('one match and it is after the list indexs object (default 0)',
    function () {
      expect(methods.arrayNextKeyValue({
        list:
      [
        { b: 'stuff' },
        { a: 'stuff' }
      ],
        key: 'a'
      })
      ).to.eql(['stuff', 1])
    })

  it('returns the KV next to the key entry',
    function () {
      expect(methods.arrayNextKeyValue({
        list:
      [
        { b: 'otherstuff' },
        { a: 'stuff' }
      ],
        key: 'a',
        index: 1
      })
      ).to.eql(['stuff', 1])
    })

  it('returns the value for the next key from the start of the starting index which does not exist',
    function () {
      expect(methods.arrayNextKeyValue({
        list:
      [
        { b: 'otherstuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 1
      })
      ).to.eql([undefined, 1])
    })

  it('returns the value for the key matching the start of the starting index',
    function () {
      expect(methods.arrayNextKeyValue({
        list:
      [
        { b: 'otherstuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 0
      })
      ).to.eql([undefined, 1])
    })
  it('returns the value for the key matching the start of the starting index',
    function () {
      expect(methods.arrayNextKeyValue({
        list:
      [
        { b: 'stuff' },
        { b: 'otherstuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 2
      })
      ).to.eql([undefined, 2])
    })
  it('returns the value for the key matching the start of the starting index',
    function () {
      expect(methods.arrayNextKeyValue({
        list:
      [
        { b: 'stuff' },
        { b: 'stuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 0
      })
      ).to.eql(['stuff', 0])
    })
  it('returns the value and the index of the object for the key matching before the starting index 1',
    function () {
      expect(methods.arrayNextKeyValue({
        list:
      [
        { b: 'otherstuff' },
        { c: 'stuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 1
      })
      ).to.eql([undefined, 1])
    })
  it('returns the value and the index of the object for the key matching before the starting index 2',
    function () {
      expect(methods.arrayNextKeyValue({
        list:
      [
        { b: 'otherstuff' },
        { c: 'stuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 2
      })
      ).to.eql([undefined, 0])
    })
  it('returns the value and the index of the object for the key matching before the starting index 2',
    function () {
      expect(methods.arrayNextKeyValue({
        list:
      [
        { b: 'otherstuff' },
        { b: 'stuff' },
        { a: 'stuff' }
      ],
        key: 'b',
        index: 0
      })
      ).to.eql(['stuff', 1])
    })
})
