/*
 * Message storage
 *
 * Store messages and represent its by query
 */
const MAX_STORAGE_SIZE = 1024 // maximum size for REPRESENT result

class Keeper {
  constructor (maxStorageSize) {
    this.maxStorageSize = maxStorageSize || MAX_STORAGE_SIZE // maximum size for REPRESENT result
    this.storage = [] // online storage
    this.archStorage = [] // archive storage extender
    this.counter = 0
  }

  /*
   * Set maximum size for REPRESENT result
   */
  setMaxStorageSize (maxStorageSize) {
    this.maxStorageSize = maxStorageSize
  }

  /*
   * Save message
   */
  saveMessage (message) {
    let currentSize

    // add internal fields
    message.id = this.getNewCount()
    message.timestamp = +new Date()
    currentSize = this.storage.push(message)
    if (currentSize >= this.maxStorageSize) {
      this.doRotateStorage()
    }
  }

  /*
   * Return saved messages
   */
  getMessages () {
    let currentSize = this.storage.length

    return this.archStorage.slice(currentSize).concat(this.storage)
  }

  /*
   * Return max message id
   */
  getLastId () {
    return this.counter
  }

  /*
   * Storage rotator
   *
   * fast but memory cost
   */
  doRotateStorage () {
    this.archStorage = this.storage
    this.storage = []
  }

  /*
   * Return new (incremented) counter
   */
  getNewCount () {
    this.counter += 1
    return this.counter
  }
}

export default Keeper
