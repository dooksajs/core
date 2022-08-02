/* global it, describe, expect, cy */
/* eslint no-undef: "error" */

describe('Dummy', () => {
  it('does nothing', () => {
    expect(true)
  })
})
describe('Loading test', () => {
  it('load test', () => {
    cy.debug()
    cy.visit('/')
  })
})
