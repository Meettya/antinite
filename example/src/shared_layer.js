// second layer file aka 'shared_layer'

import { Layer } from '..'
import BarService from './bar_service'

const LAYER_NAME = 'shared'
const SERVICES = [
  {
    name: 'BarService',
    service: new BarService(),
    acl: 764
  }
]

let layerObj = new Layer(LAYER_NAME)
layerObj.addServices(SERVICES)
