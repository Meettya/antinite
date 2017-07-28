/*
 * Модуль аудита
 */

import { Debugger } from '../../../..'

class DebuggerWrapper {
  // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно
  getServiceConfig() {
    return {
      export: {
        read: ['getData'],
        execute: ['startDebug', 'stopDebug']
      }
    }
  }

  startDebug() {
    Debugger.setMode(true)
  }

  stopDebug() {
    Debugger.setMode(false)
  }

  getData() {
    return Debugger.getData()
  }
}

export default DebuggerWrapper
