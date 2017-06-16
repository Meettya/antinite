/*
 * Просто индекс, описывающий подключаемые модули в рамках уровня (слоя)
 */

import Antinite from '../../..'

import HttpConnector from './http_connector'

const LAYER = 'services'
const WORKERS = [
  {
    name : 'HttpConnector',
    service : new HttpConnector(),
    acl : 777
  }
]

let antiniteObj = new Antinite(LAYER)
antiniteObj.addWorkers(WORKERS)
