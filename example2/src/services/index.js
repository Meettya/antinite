/*
 * Просто индекс, описывающий подключаемые модули в рамках уровня (слоя)
 */
import { Layer } from '../../..'

import HttpConnector from './http_connector'

const LAYER_NAME = 'services'
const SERVICES = [
  {
    name : 'HttpConnector',
    service : new HttpConnector(),
    acl : 777
  }
]

let layerObj = new Layer(LAYER_NAME)
layerObj.addServices(SERVICES)
