/*
 * Tests suite for System
 */
import { System, Layer, AntiniteToolkit } from '..'

import BarService from '../example/bar_service'
import { initServiceLayer, initSharedLayer } from './layers_helper'

describe('System', () => {

  describe('class', () => {
    it('should be a class', () => {
      expect(System).to.be.a('function')
    })
  })

  describe('instance', () => {
    it('should build', () => {
      expect( () => {return new System()}).not.to.throw()
    })
  })

  describe('.ensureAllIsReady()', () => {
    let systemInst = new System()

    afterEach(() => {
      // wipe all state on each test step
      AntiniteToolkit._WIPE_ALL_()
    })

    it('should pass no dependencies layer', () => {
      initSharedLayer()
      expect(() => { return systemInst.ensureAllIsReady()}).not.to.throw()
    })
    it('should pass some dependencies layers', () => {
      initServiceLayer()
      initSharedLayer()
      expect(() => { return systemInst.ensureAllIsReady()}).not.to.throw()
    })
     it('should throw not resolved', () => {
      initServiceLayer()
      expect(() => { return systemInst.ensureAllIsReady()}).to.throw()
    })
  })

  describe('.getUnreadyList()', () => {
    let systemInst = new System()

    afterEach(() => {
      // wipe all state on each test step
      AntiniteToolkit._WIPE_ALL_()
    })

    it('should return empty Array no dependencies layer', () => {
      initSharedLayer()
      expect(systemInst.getUnreadyList()).eql([])
    })
    it('should return empty Array on resolved dependencies layers', () => {
      initServiceLayer()
      initSharedLayer()
      expect(systemInst.getUnreadyList()).eql([])
    })
     it('should return result if not resolved', () => {
      initServiceLayer()
      expect(systemInst.getUnreadyList()).not.eql([])
    })
  })

  describe('.execute()', () => {
    let systemInst = new System()

    beforeEach(() => {
      initServiceLayer()
      initSharedLayer()
    })

    afterEach(() => {
      // wipe all state on each test step
      AntiniteToolkit._WIPE_ALL_()
    })

    it('should execute known action without args', () => {
      expect(() => { return systemInst.execute('shared', 'BarService', 'getBar') }).not.to.throw()
    })
    it('should execute known action with args', () => {
      expect(() => { return systemInst.execute('service', 'FooService', 'doFoo', 'here') }).not.to.throw()
    })
    it('should throw unknown layer', () => {
      expect(() => { return systemInst.execute('unknown', 'BarService', 'getBar') }).to.throw()
    })
    it('should throw unknown service', () => {
      expect(() => { return systemInst.execute('shared', 'unknown', 'getBar') }).to.throw()
    })
    it('should throw unknown action', () => {
      expect(() => { return systemInst.execute('shared', 'BarService', 'unknown') }).to.throw()
    })
    it('should throw access denied action', () => {
      const SERVICES = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: '064'
        }
      ]
      // HACK to hide console.warn
      let thisConsole = console
      console.warn = () => {}

      new Layer('deniedLayer').addServices(SERVICES)
      expect(() => { return systemInst.execute('deniedLayer', 'BarService', 'getBar') }).to.throw()
      // return console.warn
      console.warn = thisConsole.warn
    })
  })
})
