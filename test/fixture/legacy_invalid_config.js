/*
 * Legacy Class
 */

import { Legacy } from '../..'

class LegacyInvalidConfig {
  constructor(props){
    this.registerAsLegacy()
  }

  registerAsLegacy() {
    Legacy.register(
      {
        layer: 'services',
        name : 'LegacyInvalidConfig',
        service: this,
        acl: 777
      }
    )
  }

  getServiceConfig() {
    return ({
      foo: {
        FooService: ['doFoo']
      }
    })
  }

  doQuiz(arg) {
    return this.doRequireCall('FooService', 'doFoo', 'legacy')
  }

  getStatus() {
    return 'LegacyInvalidConfig'
  }

}

export default LegacyInvalidConfig
