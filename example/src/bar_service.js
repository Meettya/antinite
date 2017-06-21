// second service file aka 'bar_service'

// MAY not to extend AntiniteService if NOT use 'require' section
class BarService {
  constructor (props) {
  }

  getServiceConfig () {
    return ({
      export: {
        read: ['getBar'] // this action will exported as 'read' type
      }
    })
  }

  getBar () {
    return 'its bar'
  }
}

export default BarService
