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
