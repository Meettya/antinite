/*
 * Tests suite for Debugger
 */
import { Debugger, AntiniteToolkit } from '..'
import { initServiceLayer, initSharedLayer } from './layers_helper'

describe('Debugger', () => {
  afterEach(() => {
    // wipe all state on each test step
    AntiniteToolkit._WIPE_ALL_()
  })

  describe('#setMode()', () => {
    it('should enable log with "true"', () => {
      Debugger.setMode(true)
      initServiceLayer()
      initSharedLayer()
      expect(Debugger.getData()).to.have.lengthOf(3)
    })
    it('should disable log with "false"', () => {
      Debugger.setMode(false)
      initServiceLayer()
      initSharedLayer()
      expect(Debugger.getData()).to.be.empty
    })
  })

  describe('#getData()', () => {
    it('should get log data', () => {
      Debugger.setMode(true)
      initServiceLayer()
      initSharedLayer()
      expect(Debugger.getData()).to.have.lengthOf(3)
    })
  })

  describe('#setLogSize()', () => {
    it('should set log size', () => {
      Debugger.setMode(true)
      Debugger.setLogSize(2)
      initServiceLayer()
      initSharedLayer()
      expect(Debugger.getData()).to.have.lengthOf(2)
    })
  })
})
