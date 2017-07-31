/* 
 * Модуль, читающий конфиги
 *
 * возможно будет кешировать и отслеживать изменения
 */

class ConfigReader {
  // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно
  getServiceConfig() {
    return {
      require: {
        Logger: ['log']
      },
      export: {
        execute: ['read'],
        read: ['getStatus']
      }
    }
  }

  read(fileName) {
    this.doRequireCall('Logger', 'log', '!!! ConfigReader', 'read', fileName)
    return { foo: 'bar', bazz : 42}
  }

  getStatus() {
    return { cached: 0 }
  }

}

export default ConfigReader