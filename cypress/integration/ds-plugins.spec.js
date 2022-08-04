import DsPlugin from '@dooksa/ds-plugin'
import myPlugin from '../../src'

/* global it, describe, expect */
/* eslint no-undef: "error" */

describe('check plugin created', () => {
  it('check plugin name', () => {
    const plugin = new DsPlugin(myPlugin, [])
    expect(plugin.name).equal('dsStarterKit')
  })
  it('check plugin name with context', () => {
    const plugin = new DsPlugin(myPlugin, [{ name: 'isDev', value: true }])
    expect(plugin.name).equal('dsStarterKit')
  })
})
