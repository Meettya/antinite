/*
 * Просто индекс, описывающий подключаемые модули в рамках уровня (слоя)
 */

import Antinite from '../../..'

import ConfigReader from './config_reader'
import Logger from './logger'

const LAYER = 'shared'
const WORKERS = [
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

let antiniteObj = new Antinite(LAYER)
antiniteObj.addWorkers(WORKERS)
