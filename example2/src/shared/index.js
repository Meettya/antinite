/*
 * Просто индекс, описывающий подключаемые модули в рамках уровня (слоя)
 */
import { Layer } from '../../..'

import ConfigReader from './config_reader'
import Logger from './logger'

const LAYER_NAME = 'shared'
const SERVICES = [
  {
    name: 'ConfigReader',
    service: new ConfigReader(),
    acl: 751
  },
  {
    name : 'Logger',
    service : new Logger(),
    acl : 762
  }
]

let layerObj = new Layer(LAYER_NAME)
layerObj.addServices(SERVICES)
