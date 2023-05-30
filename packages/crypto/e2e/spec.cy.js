/// <reference types="cypress" />

import { uuid, checksum } from '../../lib/main'

describe('crypto uuid', function () {
  it('should generate uuid', function () {
    const id = uuid()

    expect(id).to.have.lengthOf(8)
  })
})

describe('crypto checksum', function () {
  it('should generate checksum', function () {
    const id = checksum({ a: 1 })

    expect(id).to.have.equal('082a0209')
  })
})
