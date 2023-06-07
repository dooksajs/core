/// <reference types="cypress" />

import objectHash from '../../src/main'

describe('objectHash', function () {
  it('should generate checksum', function () {
    const checksum = objectHash({ a: 1, b: 2, c: 3 })

    expect(checksum).to.have.equal('2d3d0487')
  })

  it('should order keys alphanumerically', function () {
    const checksumOne = objectHash({ z: 3, b: 2, a: 1, 1: 0 })
    const checksumTwo = objectHash({ a: 1, 1: 0, z: 3, b: 2 })

    expect(checksumOne).to.have.equal(checksumTwo)
  })

  it('should order keys alphanumerically at depth', function () {
    const checksumOne = objectHash({
      a1: {
        a2: {
          a3: 1
        },
        b2: {
          a3: 2
        }
      },
      b2: {
        a2: {
          a3: 1
        },
        b2: {
          a3: 2
        }
      }
    })
    const checksumTwo = objectHash({
      b2: {
        b2: {
          a3: 2
        },
        a2: {
          a3: 1
        }
      },
      a1: {
        b2: {
          a3: 2
        },
        a2: {
          a3: 1
        }
      }
    })

    expect(checksumOne).to.have.equal(checksumTwo)
  })

  it('should checksum an array', function () {
    const checksumArray = objectHash([1, 2, 3])

    expect(checksumArray).to.have.equal('069501a7')
  })

  it('should preserve array order', function () {
    const checksumOne = objectHash({ a: [3, 2, 1] })
    const checksumTwo = objectHash({ a: [1, 2, 3] })

    expect(checksumOne).to.not.equal(checksumTwo)
  })
})
