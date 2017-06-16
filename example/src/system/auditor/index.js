/*
 * Модуль аудита
 */

import { AntiniteAuditor } from '../../../..'

class Auditor {
  constructor(props){
    this.antiniteAuditor = new AntiniteAuditor('Auditor')
  }

  // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно
  getWorkerConfig() {
    return {
      export: {
        read: ['getData'],
        execute: ['startAudit', 'stopAudit']
      }
    }
  }

  startAudit() {
    this.antiniteAuditor.setMode(true)
  }

  stopAudit() {
    this.antiniteAuditor.setMode(false)
  }

  getData() {
    return this.antiniteAuditor.getData()
  }
}

export default Auditor
