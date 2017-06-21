// first layer file aka 'services_layer'

import { Layer } from '..'
import FooService from './foo_service'

const LAYER_NAME = 'service' // domain for services aka layer
const SERVICES = [ // services list
  {
    name: 'FooService', // exported service name
    service: new FooService(), // service object
    acl: 711 // service rights (for system/layer/other)
  }
]

let layerObj = new Layer(LAYER_NAME) // register layer
layerObj.addServices(SERVICES) // fullfill with services
