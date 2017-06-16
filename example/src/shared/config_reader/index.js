/* 
 * Модуль, читающий конфиги
 *
 * возможно будет кешировать и отслеживать изменения
 */
import { AntiniteService } from '../../../..'

class ConfigReader extends AntiniteService {
  constructor(props){
    super(props)
  }

  // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно
  getWorkerConfig() {
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