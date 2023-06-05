/// <reference types="cypress" />

import parseAction from '../../src/main'

describe('Parse action', function () {
  beforeEach(() => {
    cy.fixture('actionTemplate').as('actionTemplate')
  })

  it('should return sequenceId', function () {
    const action = parseAction(this.actionTemplate)

    expect(action.sequenceId).to.equal('017500f9')
  })

  it('should contain items', function () {
    const action = parseAction(this.actionTemplate)

    expect(action).to.have.nested.property('items.4f472d7e')
    expect(action).to.have.nested.property('items.97f8149c')
    expect(action).to.have.nested.property('items.272030df')
    expect(action).to.have.nested.property('items.b686112c')
  })

  it('should contain sequence', function () {
    const action = parseAction(this.actionTemplate)

    expect(action).to.have.nested.include({ 'sequence[0].id': '97f8149c' })
    expect(action).to.have.nested.include({ 'sequence[1].id': '272030df' })
    expect(action).to.have.nested.include({ 'sequence[2].id': 'b686112c' })
    expect(action).to.have.nested.include({ 'sequence[3].id': '4f472d7e' })
  })
})
