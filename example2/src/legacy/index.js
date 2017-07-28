/*
 * Legacy Class
 */

import { Legacy } from '../../..'

class LegacyService {
  constructor(props){
    this.registerAsLegacy()
  }

  registerAsLegacy() {
    Legacy.register(
      {
        layer: 'services',
        name : 'LegacyService',
        service: this,
        acl: 777
      }
    )
  }

  getServiceConfig() {
    return ({
      require: {
        Logger: ['log'],
        ConfigReader:['read']
      },
      export: {
        read: ['getStatus']
      }
    })
  }

  doQuiz(arg) {
    return this.doRequireCall('ConfigReader', 'read', 'legacy_config_read')
  }

  getStatus() {
    return 'LegacyService'
  }

}

export default LegacyService