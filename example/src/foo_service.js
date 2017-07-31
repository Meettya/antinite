// first service file aka 'foo_service'

class FooService {
  getServiceConfig () { // IMPORTANT - convented function name for service config
    return ({
      require: {
        BarService: ['getBar'] // this is external dependency
      },
      export: {
        execute: ['doFoo'] // this action will exported as 'execute' type (all types - 'execute', 'write', 'read')
      }
    })
  }

  doFoo (where) {
    let bar = this.doRequireCall('BarService', 'getBar') // call to remote service, convented function name

    return `${where} ${bar} and foo`
  }
}

export default FooService
