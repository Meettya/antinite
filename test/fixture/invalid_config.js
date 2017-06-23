/*
 * Invalid config
 */

 class InvalidConfig {
  constructor (props) {
  }

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
