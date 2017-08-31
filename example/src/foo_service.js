// first service file aka 'foo_service'

class FooService {
  getServiceConfig () { // IMPORTANT - convented function name for service config
    return ({
      require: {
        BarService: ['getBar'] // this is external dependency
      },
      export: {
        execute: ['doFoo'] // this action will exported as 'execute' type (all types - 'execute', 'write', 'read')
      },
      options: { // options for service
        injectRequire : true // inject require part to class itsels
      }
    })
  }

  doFoo (where) {
    // always available require call 
    let bar = this.doRequireCall('BarService', 'getBar') // call to remote service, convented function name
    // or with `options.injectRequire` = true
    let bars = this.BarService.getBar()

    return `${where} ${bar} and foo and ${bars}`
  }
}

export default FooService
