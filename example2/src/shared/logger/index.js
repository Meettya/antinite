/*
 * Простой модуль логирования
 */

class Logger {
  // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно
  getServiceConfig() {
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
