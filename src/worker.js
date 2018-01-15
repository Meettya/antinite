/*
 * Worker class
 */
import { has, isPromise } from './helper'

import groupsLevel from './groups_levels'

// service lifecycle stages
const WORKERS_STATES = {
  error: 'error',
  created: 'created',
  registered: 'registered',
  resolved: 'resolved',
  init_await: 'init_await',
  inited: 'inited',
  ready: 'ready'
}

// export livels
const WORKER_EXPORT_LIVELS = new Set(['read', 'write', 'execute'])

class Worker {
  constructor ({name, service, acl, isLegacy, layerName}) {
    this.name = name
    this.service = service
    this.acl = acl
    this.isWorkerLegacy = !!isLegacy
    this.layerName = layerName
    this.state = WORKERS_STATES.created
    this.exportDict = {}
    this.requireDict = {}
    this.requirePending = {}
    this.lookUpFn = this.zeroLookUp
    this.messagerBus = () => {}
    this.reportsState = {}
    this.proxyUpcomingExecute = this.proxyUpcomingExecute.bind(this)
  }

  /*
   * Setup parent look up
   */
  setLookUp (lookUpFn) {
    this.lookUpFn = (...args) => { return lookUpFn(this.getName(), ...args) }
  }

  /*
   * Setup parent messages bus
   */
  setMessagerBus (messagerBus) {
    this.messagerBus = messagerBus
  }

  /*
   * Setup report state (to avoid unnided work)
   */
  setReportsState (reportsState) {
    this.reportsState = reportsState
  }

  /*
   * Empty parent look up forbidden
   */
  zeroLookUp () {
    throw Error('No look up function is set, cant resolve dependencies!')
  }

  /*
   * Return worker name
   */
  getName () {
    return this.name
  }

  /*
   * Return worker status
   */
  getStatus () {
    return this.state
  }

  /*
   * Return worker ACL
   */
  getAcl () {
    return this.acl
  }

  /*
   * Return worker legacy status
   */
  isLegacy () {
    return this.isWorkerLegacy
  }

  /*
   * Detect is action available for caller
   */
  isActionGranted (groupType, action) {
    let groupRights = this.getAclFor(groupType)
    let actionType = this.getExportFnType(action)

    return groupRights[actionType]
  }

  /*
   * Get group rights as dictionary
   */
  getAclFor (groupType) {
    let aclDigit = this.getAclPart(this.acl, groupType)

    return this.parseAclToDict(aclDigit)
  }

  /*
   * Worker prepare steps block
   */
  prepareModule () {
    this.checkService()
    this.processPresenter()
    this.state = WORKERS_STATES.registered
    this.processRequires()
    this.injectDoRequire()
    if (this.isRequireSolved()) {
      this.processInit()
    }
    return this
  }

  /*
   * Steps to resolve pendings requires
   *
   * in case of some layer register
   */
  doResolvePending () {
    if (!this.isRequireSolved()) {
      this.processPendingRequires()
    }
    // YES, second test - may be requires resolved NOW, after first block
    if (this.isRequireSolved()) {
      this.processInit()
    }
    return this
  }

  /*
   * Check service configuratin is correct
   */
  checkService () {
    let workerConfig

    try {
      workerConfig = this.service.getServiceConfig()
    } catch (err) {
      console.warn(`-  (x) Cant get config for |${this.layerName}.${this.name}|, check it is VALID class INSTANCE, not class itself!`)
      throw Error(err)
    }

    if (!has(workerConfig, 'export')) {
      throw TypeError('Wrong worker configuration, halt!')
    }
  }

  /*
   * Void rights dictionary
   */
  getZeroAclDict () {
    return {
      read: false,
      write: false,
      execute: false
    }
  }

  /*
   * Get group ACL part
   */
  getAclPart (fullAcl, groupType) {
    // дополняем набор, справа, дабы неверно написанные права не поднимали уровень доступа ( например 7 - это права 700, а не 007)
    let fullAclStr = `${fullAcl}000`.slice(0, 3)

    switch (groupType) {
      case groupsLevel.system:
        return fullAclStr.charAt(0) | 0
      case groupsLevel.group:
        return fullAclStr.charAt(1) | 0
      case groupsLevel.other:
        return fullAclStr.charAt(2) | 0
      default:
        return 0
    }
  }

  /*
   * Translate ACL digit to rights dictionary
   */
  parseAclToDict (aclDigit) {
    let res = this.getZeroAclDict()

    switch (aclDigit) {
      case 1:
        res.execute = true
        break
      case 2:
        res.write = true
        break
      case 3:
        res.execute = true
        res.write = true
        break
      case 4:
        res.read = true
        break
      case 5:
        res.execute = true
        res.read = true
        break
      case 6:
        res.write = true
        res.read = true
        break
      case 7:
        res.execute = true
        res.write = true
        res.read = true
        break
    }
    return res
  }

  /*
   * Internal module prepare step
   *
   * reverse dictionary
   */
  processPresenter () {
    this.exportDict = this.processExportDict()
  }

  /*
   * Do require processing
   *
   * may fall if no module finded
   */
  processRequires () {
    let lookUpRes, funcsList
    let isNeedInject = false
    let workerConfig = this.service.getServiceConfig()

    if (!has(workerConfig, 'require')) {
      return
    }
    // inspect service options
    if (has(workerConfig, 'options')) {
      if (has(workerConfig.options, 'injectRequire')) {
        isNeedInject = !!workerConfig.options.injectRequire
      }
    }

    Object.keys(workerConfig.require).forEach((service) => {
      funcsList = workerConfig.require[service]
      if (!this.requireDict[service]) {
        this.requireDict[service] = {}
      }
      if (isNeedInject) {
        if (has(this.service, service)) {
          throw Error(`service |${this.layerName}.${this.name}| allready has field |${service}|, cant inject, halt!`)
        }
        this.service[service] = {}
      }
      funcsList.forEach((funcName) => {
        lookUpRes = this.lookUpFn(service, funcName)
        if (isNeedInject) {
          this.service[service][funcName] = this.proxyUpcomingExecute.bind(this, service, funcName)
        }
        if (lookUpRes) {
          this.requireDict[service][funcName] = lookUpRes
        } else {
          if (!this.requirePending[service]) {
            this.requirePending[service] = []
          }
          this.requirePending[service].push(funcName)
        }
      }, this)
    }, this)
  }

  /*
   * Do pending require processing
   *
   * repeat pending if no module finded
   */
  processPendingRequires () {
    let toPending, lookUpRes, funcsList

    Object.keys(this.requirePending).forEach((service) => {
      toPending = []
      funcsList = this.requirePending[service]
      funcsList.forEach((funcName, idx) => {
        lookUpRes = this.lookUpFn(service, funcName)
        if (lookUpRes) {
          this.requireDict[service][funcName] = lookUpRes
        } else {
          toPending.push(funcName)
        }
      }, this)
      // save new pending list
      this.requirePending[service] = toPending
    }, this)
  }

  /*
   * Return is worker solved require block
   */
  isRequireSolved () {
    return Object.keys(this.requirePending).every((serviceName) => {
      return this.requirePending[serviceName].length === 0
    })
  }

  /*
   * Init worker server itself
   */
  processInit () {
    // if it start init - wait for it
    if (!(this.state === WORKERS_STATES.init_await || this.state === WORKERS_STATES.inited || this.state === WORKERS_STATES.error || this.state === WORKERS_STATES.ready)) {
      this.initWorker((err) => {
        if (err) {
          this.state = WORKERS_STATES.error
          return
        }
        this.state = WORKERS_STATES.ready
        this.messagerBus('ready', `${this.layerName}.${this.name}`)
      })
    }
    return this
  }

  /*
   * Inject doRequireCall to service
   */
  injectDoRequire () {
    if (has(this.service, 'doRequireCall')) {
      throw Error(`service |${this.layerName}.${this.name}| allready has reserved |doRequireCall|, halt!`)
    }
    this.service.doRequireCall = this.proxyUpcomingExecute
  }

  /*
   * Proxy worker request to system
   */
  proxyUpcomingExecute (serviceName, action, ...args) {
    let grantedItem

    if (!this.requireDict[serviceName]) {
      throw Error(`Unknown service |${serviceName}| called`)
    }
    if (!this.requireDict[serviceName][action]) {
      throw Error(`Unknown action |${serviceName}.${action}| called`)
    }
    grantedItem = this.requireDict[serviceName][action]
    return grantedItem.layer.executeAction(grantedItem.ticket, serviceName, action, ...args)
  }

  /*
   * Sync init worker after all requeries resolved
   *
   * NB! initService may used as 1 - sync, 2 - async with callback, 3 - async with promise
   */
  initWorker (cb) {
    let initResult

    if (has(this.service, 'initService')) {
      // flag to init started (do not re-init)
      this.state = WORKERS_STATES.init_await
      // used callback
      if (this.service.initService.length === 1) {
        this.service.initService((err) => {
          if (err) {
            return cb(err)
          }
          this.state = WORKERS_STATES.inited
          return cb()
        })
        return
      }
      // sync OR promise
      try {
        initResult = this.service.initService()
      } catch (err) {
        return cb(err)
      }
      // promise
      if (isPromise(initResult)) {
        initResult
          .then(() => {
            this.state = WORKERS_STATES.inited
            cb()
          })
          .catch((err) => {
            cb(err)
          })
        return
      }
      // sync
      this.state = WORKERS_STATES.inited
      return cb()
    }
    cb()
  }

  /*
   * Return is worker ready
   */
  isReady () {
    return this.state === WORKERS_STATES.ready
  }

  /*
   * Return module export dictionary
   *
   * { functionName: type }
   */
  processExportDict () {
    let funcs
    let result = {}
    let workerConfig = this.service.getServiceConfig()

    Object.keys(workerConfig.export).forEach((level) => {
      funcs = workerConfig.export[level]
      if (!WORKER_EXPORT_LIVELS.has(level)) {
        throw SyntaxError(`Unknown export level |${level}|`)
      }
      funcs.forEach((funcName) => {
        result[funcName] = level
      })
    })
    return result
  }

  /*
   * Return function type
   */
  getExportFnType (action) {
    return this.exportDict[action]
  }

  /*
   * Check is action know by this service
   */
  isActionExists (action) {
    return !!this.exportDict[action]
  }

  /*
   * Return export dict
   */
  getExportDict () {
    return this.exportDict
  }

  getRequireDict () {
    let actions, actionObj, resolved
    let res = []

    Object.keys(this.requireDict).forEach((serviceName) => {
      actions = {}
      Object.keys(this.requireDict[serviceName]).forEach((action) => {
        actionObj = this.requireDict[serviceName][action]
        if (actionObj) {
          resolved = actionObj.layer.getName()
        }
        actions[action] = {
          isReady: !!actionObj,
          resolved
        }
      })
      res.push({
        name: serviceName,
        actions
      })
    })
    return res
  }

  /*
   * Request proxy to service
   */
  doExecute (action, ...args) {
    if (!has(this.service, action)) {
      throw Error(`service |${this.name}| hasnt action |${action}|`)
    }
    return this.service[action](...args)
  }
}

export default Worker
