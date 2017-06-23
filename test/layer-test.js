/*
 * Tests suite for Layer
 */
import { Layer, System, AntiniteToolkit } from '..'

import BarService from '../example/bar_service'
import FooService from '../example/foo_service'

const LAYER_NAME = 'test_layer_name'
const LAYER_NAME2 = 'test_layer_name2'

let systemInst = new System('test')

describe('Layer', () => {

  describe('class', () => {
    it('should be a class', () => {
      expect(Layer).to.be.a('function')
    })
  })

  describe('instance', () => {
    afterEach(() => {
      // wipe all state on each test step
      AntiniteToolkit._WIPE_ALL_()
    })

    it('should build with name', () => {
      expect( () => {return new Layer(LAYER_NAME)}).not.to.throw()
    })
    it('should throw without name', () => {
      expect( () => { return new Layer()}).to.throw()
    })
    it('should throw with empty name', () => {
      expect( () => { return new Layer('')}).to.throw()
    })
    it('should throw with non-string name', () => {
      expect( () => { return new Layer({})}).to.throw()
    })    
    it('should throw with duplicate name', () => {
      expect( () => {return new Layer(LAYER_NAME)}).not.to.throw()
      expect( () => {return new Layer(LAYER_NAME)}).to.throw()
    })
    it('should build some layers with different names', () => {
      expect( () => {return new Layer(LAYER_NAME)}).not.to.throw()
      expect( () => {return new Layer(LAYER_NAME2)}).not.to.throw()
    })
  })

  describe('.addServices()', () => {
    let layerInst

    beforeEach(() => {
      layerInst = new Layer(LAYER_NAME)
    })
    afterEach(() => {
      // wipe all state on each test step
      AntiniteToolkit._WIPE_ALL_()
    })

    it('should add correct services', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 711 
        }
      ]

      expect( () => {return layerInst.addServices(services)}).not.to.throw()
    })

    it('should throw on incorrect argument', () => {
      expect( () => {return layerInst.addServices('foo')}).to.throw()
    })
    it('should throw on incorrect service config', () => {
      let services = [
        {
          baz: 'BarService',
          bar: new BarService(),
          quiz: 711 
        }
      ]

      expect( () => {return layerInst.addServices(services)}).to.throw()
    })
    it('should add some name services to different layers', () => {
      let secondLayerInst = new Layer(LAYER_NAME2)
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 711 
        }
      ]

      expect( () => {return layerInst.addServices(services)}).not.to.throw()
      expect( () => {return secondLayerInst.addServices(services)}).not.to.throw()
    })
    it('should add some services witn differents names to one layers', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 711 
        }
      ]
      let secondServices = [
        {
          name: 'BarService2',
          service: new BarService(),
          acl: 711 
        }
      ]

      expect( () => {return layerInst.addServices(services)}).not.to.throw()
      expect( () => {return layerInst.addServices(secondServices)}).not.to.throw()
    })
    it('should throw on adding duplicate name at one layer once', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 711 
        },
        {
          name: 'BarService',
          service: new BarService(),
          acl: 711 
        }
      ]

      expect( () => {return layerInst.addServices(services)}).to.throw()
    })
    it('should throw on adding duplicate name at one layer continuously', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 711 
        }
      ]

      expect( () => {return layerInst.addServices(services)}).not.to.throw()
      expect( () => {return layerInst.addServices(services)}).to.throw()
    })
    it('should accept ACL as string', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: '711'
        }
      ]

      expect( () => {return layerInst.addServices(services)}).not.to.throw()
    })
    it('should use partial ACL as left-part (7 -> 700)', () => {
      let services = [
        {
          name: 'BarService',
          service: new BarService(),
          acl: 7
        }
      ]

      expect( () => {return layerInst.addServices(services)}).not.to.throw()
      expect( () => {return systemInst.execute(LAYER_NAME, 'BarService', 'getBar')}).not.to.throw()
    })
    it('should throw on not ready system', () => {
      let services = [
        {
          name: 'FooService',
          service: new FooService(),
          acl: 711
        }
      ]

      expect( () => {return layerInst.addServices(services)}).not.to.throw()
      expect( () => {return systemInst.execute(LAYER_NAME, 'FooService', 'doFoo', 'test')}).to.throw()
    })
  })
})
