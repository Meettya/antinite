/*
 * Tests suite for Legacy
 */
import { Layer, System, AntiniteToolkit } from '..'

import { initServiceLayer, initSharedLayer } from './layers_helper'

import BarService from '../example/bar_service'
import FooService from '../example/foo_service'

import LegacyService from '../example/legacy_service'
import LegacyService2 from './fixture/legacy2'
import LegacyInvalidConfig from './fixture/legacy_invalid_config'
import LegacyUnregistered from './fixture/legacy_unregistered'

const LAYER_NAME = 'test_layer_name'
const LAYER_NAME2 = 'test_layer_name2'

describe('Legacy', () => {
  let systemInst

  beforeEach(() => {
    systemInst = new System('test')
  })

  afterEach(() => {
    // wipe all state on each test step
    AntiniteToolkit._WIPE_ALL_()
  })

  describe('#register()', () => {
    it('should register correct case', () => {
      initServiceLayer()
      initSharedLayer()

      expect( () => { new LegacyService() }).not.to.throw()
    })
    it('should register isolated case', () => {
      expect( () => { new LegacyService() }).not.to.throw()
    })
    it('should throw original layer on name collision', () => {
      new LegacyService()
      expect( () => {new Layer('services')}).to.throw()
    })
    it('should register some correct cases', () => {
      initServiceLayer()
      initSharedLayer()
      new LegacyService()
      expect( () => { new LegacyService2() }).not.to.throw()
    })
    it('should throw legacy on service name double', () => {
      initServiceLayer()
      initSharedLayer()
      new LegacyService()
      expect( () => { new LegacyService() }).to.throw()
    })
    it('should throw legacy on invalid config', () => {
      initServiceLayer()
      initSharedLayer()
      expect( () => { new LegacyInvalidConfig() }).to.throw()
    })
  })
  describe('as antinite service', () => {
    it('should call other services', () => {
      let legacyObj

      initServiceLayer()
      initSharedLayer()
      legacyObj = new LegacyService()

      expect(legacyObj.doQuiz()).to.eql('legacy its bar and foo and its bar')
    })
    it('should throw on unready call other services', () => {
      let legacyObj = new LegacyService()

      expect( () => { legacyObj.doQuiz()}).to.throw()
    })
    it('should throw on unregistered object call other services', () => {
      let legacyObj = new LegacyUnregistered()

      expect( () => { legacyObj.doQuiz()}).to.throw()
    })
    it('should worked as service', () => {
      initServiceLayer()
      initSharedLayer()
      new LegacyService()
      expect( systemInst.execute('services', 'LegacyService', 'getStatus')).to.eql('LegacyService')
    })
    it('should throw if service not ready', () => {
      new LegacyService()
      expect( () => { return systemInst.execute('services', 'LegacyService', 'getStatus')}).to.throw()
    })
  })
})