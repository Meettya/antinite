/*
 * Tests suite for Auditor
 */
import { System, Auditor, AntiniteToolkit } from '..'
import { initServiceLayer, initSharedLayer } from './layers_helper'

describe('Auditor', () => {
  let systemInst = new System()

  afterEach(() => {
    // wipe all state on each test step
    AntiniteToolkit._WIPE_ALL_()
  })

  describe('#setMode()', () => {
    it('should enable log with "true"', () => {
      Auditor.setMode(true)
      initServiceLayer()
      initSharedLayer()
      systemInst.execute('service', 'FooService', 'doFoo', 'here')
      expect(Auditor.getData()).to.have.lengthOf(2)
    })
    it('should disable log with "false"', () => {
      Auditor.setMode(false)
      initServiceLayer()
      initSharedLayer()
      systemInst.execute('service', 'FooService', 'doFoo', 'here')
      expect(Auditor.getData()).to.be.empty
    })
  })

  describe('#getData()', () => {
    it('should get log data', () => {
      Auditor.setMode(true)
      initServiceLayer()
      initSharedLayer()
      systemInst.execute('service', 'FooService', 'doFoo', 'here')
      expect(Auditor.getData()).to.have.lengthOf(2)
    })
  })

  describe('#setLogSize()', () => {
    it('should set log size', () => {
      Auditor.setMode(true)
      Auditor.setLogSize(1)
      initServiceLayer()
      initSharedLayer()
      systemInst.execute('service', 'FooService', 'doFoo', 'here')
      expect(Auditor.getData()).to.have.lengthOf(1)
    })
  })
})
