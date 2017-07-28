/*
 * Модуль аудита
 */

import { Auditor } from '../../../..'

class AuditorWrapper {
  // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно
  getServiceConfig() {
    return {
      export: {
        read: ['getData'],
        execute: ['startAudit', 'stopAudit']
      }
    }
  }

  startAudit() {
    Auditor.setMode(true)
  }

  stopAudit() {
    Auditor.setMode(false)
  }

  getData() {
    return Auditor.getData()
  }
}

export default AuditorWrapper
