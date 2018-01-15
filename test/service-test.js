/*
 * Tests suite for Service
 */
import { Layer, System, AntiniteToolkit } from '..'

import { initServiceLayer, initSharedLayer } from './layers_helper'

import BarService from '../example/bar_service'
import FooService from '../example/foo_service'
import BazService from '../example/baz_service'
import NoConfig from './fixture/no_config'
import InvalidConfig from './fixture/invalid_config'
import InvalidRequire from './fixture/invalid_require'
import BazAcService from './fixture/baz_ac_service'
import BazApService from './fixture/baz_ap_service'

const LAYER_NAME = 'tested'

describe('Service', () => {

  describe('item', () => {
    let layerInst, systemInst

    beforeEach(() => {
      systemInst = new System()
      layerInst = new Layer(LAYER_NAME)
    })
    afterEach(() => {
      // wipe all state on each test step
      AntiniteToolkit._WIPE_ALL_()
    })

    it('should process with valid config', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 711
        }
      ]

      expect(() => { return layerInst.addServices(services) }).not.to.throw()
    })
    it('should throw without config', () => {
      let services = [
        {
          name: 'NoConfig',
          service: new NoConfig(),
          acl: 711
        }
      ]
      // HACK to hide console.warn
      let thisConsole = console
      console.warn = () => {}
      expect(() => { return layerInst.addServices(services) }).to.throw()
      // return console.warn
      console.warn = thisConsole.warn
    })
    it('should throw with invalid config', () => {
      let services = [
        {
          name: 'InvalidConfig',
          service: new InvalidConfig(),
          acl: 711
        }
      ]

      expect(() => { return layerInst.addServices(services) }).to.throw()
    })
    it('should execute action without dependencies', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 711
        }
      ]

      expect(() => { return layerInst.addServices(services) }).not.to.throw()
      expect(() => { return systemInst.execute(LAYER_NAME, 'BarService', 'getBar') }).not.to.throw()
    })
    it('should execute action with resolved granted dependencies', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 764
        }
      ]

      initServiceLayer()
      expect(() => { return layerInst.addServices(services) }).not.to.throw()
      expect(() => { return systemInst.execute('service', 'FooService', 'doFoo', 'here') }).not.to.throw()
    })

    it('should execute injected action with resolved granted dependencies', () => {
      let services = [
        {
          name: 'BazService',
          service: new BazService(),
          acl: 764
        }
      ]

      initSharedLayer()
      expect(() => { return layerInst.addServices(services) }).not.to.throw()
      expect(() => { return systemInst.execute(LAYER_NAME, 'BazService', 'doInjected') }).not.to.throw().and.eql('injected its bar')

    })

    it('should throw on inject if field already defined', () => {
      let services
      let serviceObj = new BazService()

      serviceObj.BarService = 'dummy'
      services = [
        {
          name: 'BazService',
          service: serviceObj,
          acl: 764
        }
      ]

      initSharedLayer()
      expect(() => { return layerInst.addServices(services) }).to.throw()
    })

    it('should throw on execute action with denied dependencies', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 700
        }
      ]

      expect(() => { return layerInst.addServices(services) }).not.to.throw()
      initServiceLayer()
      expect(() => { return systemInst.execute('service', 'FooService', 'doFoo', 'here') }).to.throw()
    })
    it('should throw on execute action with unresolved dependencies', () => {
      initServiceLayer()
      expect(() => { return systemInst.execute('service', 'FooService', 'doFoo', 'here') }).to.throw()
    })
    it('should throw on execute action with invalid service request (not listed at "require")', () => {
      let services = [
        {
          name: 'InvalidRequire',
          service: new InvalidRequire(),
          acl: 711
        }
      ]

      expect(() => { return layerInst.addServices(services) }).not.to.throw()
      initSharedLayer()
      expect(() => { return systemInst.execute(LAYER_NAME, 'InvalidRequire', 'doBaz', 'here') }).to.throw()
    })
    it('should throw on execute action with invalid action request (not listed at "require")', () => {
      let services = [
        {
          name: 'InvalidRequire',
          service: new InvalidRequire(),
          acl: 711
        }
      ]

      expect(() => { return layerInst.addServices(services) }).not.to.throw()
      initSharedLayer()
      expect(() => { return systemInst.execute(LAYER_NAME, 'InvalidRequire', 'doFoo') }).to.throw()
    })
  })

  describe('.initService()', () => {
    let layerInst, systemInst

    beforeEach(() => {
      systemInst = new System()
      layerInst = new Layer(LAYER_NAME)
    })
    afterEach(() => {
      // wipe all state on each test step
      AntiniteToolkit._WIPE_ALL_()
    })

    it('should ignored if ommited', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 711
        }
      ]

      expect(() => { return layerInst.addServices(services) }).not.to.throw()
    })
    it('should executed if presented as synchronous', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 740
        },
        {
          name: 'BazService',
          service: new BazService(),
          acl: 711
        }
      ]

      expect(() => { return layerInst.addServices(services) }).not.to.throw()
      expect(() => { return systemInst.execute(LAYER_NAME, 'BazService', 'doBaz') }).not.to.throw()
      systemInst.execute(LAYER_NAME, 'BazService', 'doBaz').should.eql('baz inited with its bar')
    })
    it('should executed if presented as asynchronous with callbacks', (done) => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 740
        },
        {
          name: 'BazAcService',
          service: new BazAcService(),
          acl: 711
        }
      ]

      systemInst.onReady(() => {
        expect(() => { return systemInst.execute(LAYER_NAME, 'BazAcService', 'doBaz') }).not.to.throw()
        systemInst.execute(LAYER_NAME, 'BazAcService', 'doBaz').should.eql('baz inited with its bar')
        done()
      })
      expect(() => { return layerInst.addServices(services) }).not.to.throw()
    })
    it('should executed if presented as asynchronous with callback in service and system promise', (done) => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 740
        },
        {
          name: 'BazAcService',
          service: new BazAcService(),
          acl: 711
        }
      ]

      systemInst.onReady()
        .then(() => {
          expect(() => { return systemInst.execute(LAYER_NAME, 'BazAcService', 'doBaz') }).not.to.throw()
          systemInst.execute(LAYER_NAME, 'BazAcService', 'doBaz').should.eql('baz inited with its bar')
          done()
        })
      expect(() => { return layerInst.addServices(services) }).not.to.throw()
    })
    it('should executed if presented as asynchronous with promises', (done) => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 740
        },
        {
          name: 'BazApService',
          service: new BazApService(),
          acl: 711
        }
      ]

      systemInst.onReady()
        .then(() => {
          expect(() => { return systemInst.execute(LAYER_NAME, 'BazApService', 'doBaz') }).not.to.throw()
          systemInst.execute(LAYER_NAME, 'BazApService', 'doBaz').should.eql('baz inited with its bar')
          done()
        })
      expect(() => { return layerInst.addServices(services) }).not.to.throw()
    })
    it('should not processed if not ready', () => {
      let services = [
        {
          name: 'BazService',
          service: new BazService(),
          acl: 711
        }
      ]

      expect(() => { return layerInst.addServices(services) }).not.to.throw()
      expect(() => { return systemInst.execute(LAYER_NAME, 'BazService', 'doBaz') }).to.throw()
   })
  })
})
