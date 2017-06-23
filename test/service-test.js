/*
 * Tests suite for Service
 */
import { Service, Layer, System, AntiniteToolkit } from '..'

import { initServiceLayer, initSharedLayer } from './layers_helper'

import BarService from '../example/bar_service'
import FooService from '../example/foo_service'
import NoConfig from './fixture/no_config'
import InvalidConfig from './fixture/invalid_config'
import InvalidRequire from './fixture/invalid_require'

const LAYER_NAME = 'tested'

describe('Service', () => {
  describe('class', () => {
    it('should be a class', () => {
      return expect(Service).to.be.a('function')
    })
    it('should realize convicted contract', () => {
      let serviceInst = new Service()

      return expect(serviceInst).itself.to.respondTo('doRequireCall')
    })
  })
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
})
