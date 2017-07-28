/*
 * Просто индекс, описывающий подключаемые модули в рамках уровня (слоя)
 */
import { Layer } from '../../..'

import Auditor from './auditor'
import Debugger from './debugger'

const LAYER_NAME = 'system'
const SERVICES = [
  {
    name: 'Auditor',
    service: new Auditor(),
    acl: 744
  },
  {
    name: 'Debugger',
    service: new Debugger(),
    acl: 744
  }
]

let layerObj = new Layer(LAYER_NAME)
layerObj.addServices(SERVICES)
