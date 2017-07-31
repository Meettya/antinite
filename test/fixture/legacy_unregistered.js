/*
 * Legacy Class
 */

import { Legacy } from '../..'

class LegacyUnregistered {
  constructor(props){
  }

  registerAsLegacy() {
    Legacy.register(
      {
        layer: 'services',
        name : 'LegacyUnregistered',
        service: this,
        acl: 777
      }
    )
  }

  getServiceConfig() {
    return ({
      require: {
        FooService: ['doFoo']
      },
      export: {
        read: ['getStatus']
      }
    })
  }

  doQuiz(arg) {
    return this.doRequireCall('FooService', 'doFoo', 'legacy')
  }

  getStatus() {
    return 'LegacyUnregistered'
  }

}

export default LegacyUnregistered
