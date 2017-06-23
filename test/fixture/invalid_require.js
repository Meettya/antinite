/*
 * Invalid require 
 */
import { Service } from '../..'

class FooService extends Service {
  constructor (props) {
    super(props)
  }

  getServiceConfig () {
    return ({
      require: {
        BarService: ['getBar']
      },
      export: {
        execute: ['doBaz', 'doFoo']
      }
    })
  }

  doBaz (where) {
    let bar = this.doRequireCall('BazService', 'getBaz')

    return `${where} ${bar} and foo`
  }
  
  doFoo () {
    return this.doRequireCall('BarService', 'getBaz')
  }
}

export default FooService
