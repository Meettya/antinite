/*
 * Просто индекс, описывающий подключаемые модули в рамках уровня (слоя)
 */

import Antinite from '../../..'

import Auditor from './auditor'
import Debugger from './debugger'

const LAYER = 'system'
const WORKERS = [
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

let antiniteObj = new Antinite(LAYER)
antiniteObj.addWorkers(WORKERS)
