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
