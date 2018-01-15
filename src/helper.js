/*
 * helpers
 */

const has = (obj, key) => {
  if (obj === undefined || obj === null || typeof obj !== 'object') {
    return false
  }
  if (obj[key] === undefined || obj[key] === null) {
    return false
  }
  return true
}

const isPromise = (obj) => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

export { has, isPromise }
