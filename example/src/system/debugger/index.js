/*
 * Модуль аудита
 */

import { AntiniteDebugger } from '../../../..'

class Debugger {
  constructor(props){
    this.antiniteDebugger = new AntiniteDebugger('Debugger')
  }

  // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно
  getWorkerConfig() {
    return {
      export: {
        read: ['getData'],
        execute: ['startDebug', 'stopDebug']
      }
    }
  }

  startDebug() {
    this.antiniteDebugger.setMode(true)
  }

  stopDebug() {
    this.antiniteDebugger.setMode(false)
  }

  getData() {
    return this.antiniteDebugger.getData()
  }
}

export default Debugger
