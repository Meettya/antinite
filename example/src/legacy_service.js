/*
 * Legacy Class
 */

import { Legacy } from '..'

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
    return 'LegacyService'
  }

}

export default LegacyService