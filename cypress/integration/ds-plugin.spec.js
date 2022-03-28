/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */
import DsPlugin from '@dooksa/ds-plugin'
import dsOperators from '../../src'
const plugin = new DsPlugin(dsOperators)
const methods = plugin.methods

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

describe('test for arrayFindByKeyValue', function () {
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

// describe('test ds-plugin-operators array*', () => {
//   /* grab and use JSON file containing all test case arguments
//      This JSON is also used by webpack dev to display
//      a list of tests with RUN buttons
//      JSON schema and JSON data served by Webpack from data directory */
//   const arrayTests = require('./fixtures/arrayTests.json')
//   for (let i = 0; i < arrayTests.length; i++) {
//     const arrayTest = JSON.stringify(arrayTests[i])
//     if (arrayTest.match(/\$/)) { // JSON comment added disables tests
//       continue
//     }
//     it(`arrayTest number: ${i} `, () => {
//       expect(methods.arrayTests[i].operator({
//         arrayTests[i].
//       }

//       ))
//       Cypress.$('#data-arrayop').html('')
//       cy.get('#operand-0').clear().type(`${arrayTest}`, { parseSpecialCharSequences: false })
//       cy.get('#operator').clear().type(`${arrayTests[i].operator}`)
//       cy.get('button').click()
//       cy.get('#data-arrayop').should('has.text', `${JSON.stringify(arrayTests[i])} ${arrayTests[i].operator}  -> ${arrayTests[i].expectedResult}`)
//     })
//   }
// })
