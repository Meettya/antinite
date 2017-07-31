/*
 * Модуль соединения по HTTP
 */

class HttpConnector {
  constructor(props){
    this.isOpened = false
  }

  getServiceConfig() {
    return ({
      require: {
        Logger: ['log'],
        ConfigReader:['read']
      },
      export: {
        read: ['getStatus'],
        write: ['sendData'],
        execute: ['open', 'close']
      }
    })
  }

  open() {
    this.doRequireCall('ConfigReader', 'read', 'http_connector_config')
    this.isOpened = true
  }

  close() {
    this.isOpened = false
  }

  getStatus() {
    return this.isOpened
  }

  sendData(message) {
    this.doRequireCall('Logger', 'log', '!!! HttpConnector', 'call shared service from another layer!!!', message)
    console.log(message)
  }

}

export default HttpConnector
