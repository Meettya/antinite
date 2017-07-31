/*
 * Invalid config
 */

 class InvalidConfig {
  getServiceConfig () {
    return ({
      foo: {
        read: ['getBar'] // this action will exported as 'read' type
      }
    })
  }

  getBar () {
    return 'its bar'
  }
}

export default InvalidConfig
