// service with .initService() aka 'baz_service'

class BazApService {
  constructor(){
    this.storage = null // internal field of class
  }

  getServiceConfig () { // IMPORTANT - convented function name for service config
    return ({
      require: {
        BarService: ['getBar'] // this is external dependency
      },
      export: {
        execute: ['doBaz', 'doInjected'] // this action will exported as 'execute' type (all types - 'execute', 'write', 'read')
      },
      options: { // options for service
        injectRequire : true // inject require part to class itsels
      }
    })
  }

  initService () { // IMPORTANT - convented function name for service init

    return new Promise((resolve, reject) => {
      let processor = () => {
        let bar = this.doRequireCall('BarService', 'getBar') // call to remote service, convented function name

        this.storage = bar
        return resolve()
      }

      setTimeout(() => { processor() }, 40)
    })
  }

  doBaz() { // use inited data
    return `baz inited with ${this.storage}`
  }

  doInjected() {
    let bar = this.BarService.getBar()

    return `injected ${bar}`
  }
}

export default BazApService
