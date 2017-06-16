/*
 * Простой модуль логирования
 */

class Logger {
  constructor(props){
  }

  // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно
  getWorkerConfig() {
    return {
      export: {
        write: ['log']
      }
    }
  }

  log(...message) {
    console.log(...message)
  }
}

export default Logger
