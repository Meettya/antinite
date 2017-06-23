/*
 * Layer creator helper
 */
import { Layer } from '..'

import BarService from '../example/bar_service'
import FooService from '../example/foo_service'

let initServiceLayer = () => {
  const LAYER_NAME = 'service'
  const SERVICES = [ 
    {
      name: 'FooService',
      service: new FooService(),
      acl: 711
    }
  ]

  new Layer(LAYER_NAME).addServices(SERVICES)
}

let initSharedLayer = () => {
  const LAYER_NAME = 'shared'
  const SERVICES = [
    {
      name: 'BarService',
      service: new BarService(),
      acl: 764
    }
  ]

  new Layer(LAYER_NAME).addServices(SERVICES)
}

export { initServiceLayer, initSharedLayer }