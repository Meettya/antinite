/*
 * Legacy Class
 */

import { Legacy } from '../..'

class LegacyService2 {
  constructor(props){
    this.registerAsLegacy()
  }

  registerAsLegacy() {
    Legacy.register(
      {
        layer: 'services',
        name : 'LegacyService2',
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
    return 'LegacyService2'
  }

}

export default LegacyService2
