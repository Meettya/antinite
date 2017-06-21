/*
 * Layer for services
 */

import groupsLevel from './groups_levels'
import Worker from './worker'

class Layer {
  constructor (layerName, {globalLookUp, pendingRestarter, messagerBus, reportsState}) {
    this.name = layerName
    this.globalLookUp = globalLookUp // global look up ref
    this.pendingRestarter = pendingRestarter // pending look up ref
    this.messagerBus = messagerBus
    this.reportsState = reportsState
    this.registeredWorkers = {}
    this.grantedTickets = new WeakSet() // storage for granted tickets to services at resolving stage
    this.localLookUp = this.localLookUp.bind(this)
  }

  getName () {
    return this.name
  }

  /*
   * Add some services to layer
   */
  addWorkers (workersList) {
    if (!Array.isArray(workersList)) {
      throw TypeError('Workers list must be an Array, halt!')
    }
    workersList.forEach(this.addWorker, this)
    // first service may have last one as require - just retry
    this.repeatResolving()
    this.pendingRestarter()
    // for log sys
    if (this.reportsState.isDebuggEnabled) {
      this.messagerBus('debugger', { message: `OK: layer |${this.name}| add workers` })
    }
    return this
  }

  /*
   * Restart dependencies
   */
  repeatResolving () {
    let worker

    Object.keys(this.registeredWorkers).forEach((workerName) => {
      worker = this.registeredWorkers[workerName]
      if (!worker.isReady()) {
        worker.doResolvePending()
      }
    }, this)
  }

  /*
   * Add one service to layer
   */
  addWorker (workerDesc) {
    let currentWorker, workerName

    if (!(Reflect.has(workerDesc, 'name') && Reflect.has(workerDesc, 'service') && Reflect.has(workerDesc, 'acl'))) {
      throw TypeError('Wrong worker description, halt!')
    }
    currentWorker = new Worker(workerDesc)
    currentWorker.setLookUp(this.localLookUp.bind(this))
    currentWorker.setMessagerBus(this.messagerBus)
    currentWorker.setReportsState(this.reportsState)
    workerName = currentWorker.getName()
    this.registeredWorkers[workerName] = currentWorker
    currentWorker.prepareModule({layerName: this.getName()})
  }

  localLookUp (callerName, serviceName, action) {
    let res
    let callerLayer = this.getName()

    res = this.serviceLookup(callerLayer, callerName, groupsLevel.group, serviceName, action)
    if (!res) {
      res = this.globalLookUp(callerLayer, callerName, serviceName, action)
    }
    return res
  }

  isServiceRegistered (serviceName) {
    return !!this.registeredWorkers[serviceName]
  }

  /*
   * Local look up (at layer)
   */
  serviceLookup (callerLayer, callerName, callerGroup, serviceName, action) {
    let message
    let ticket = { callerGroup, callerName, callerLayer }
    let service = this.registeredWorkers[serviceName]

    if (service) {
      message = (`for ${callerLayer}.${callerName} (group |${callerGroup}|) to ${this.getName()}.${serviceName}.${action} (mask ${service.getAcl()}, type |${service.getExportFnType(action)}|)`)
      if (service.isActionGranted(callerGroup, action)) {
        // for log sys
        if (this.reportsState.isDebuggEnabled) {
          this.messagerBus('debugger', { message: `OK: access granted ${message}` })
        }
        this.grantedTickets.add(ticket)
        // return ticket AND layer in duty to ASAP execution
        return { ticket, layer: this }
      } else {
        // for log sys
        if (this.reportsState.isDebuggEnabled) {
          this.messagerBus('debugger', { message: `FAIL: access denied ${message}` })
        }
        console.warn(`-  (x) Access denied ${message}`)
      }
    }
  }

  /*
   * Execute action, if caller has valid ticket
   */
  executeAction (ticket, serviceName, action, ...args) {
    let service = this.registeredWorkers[serviceName]

    if (!this.grantedTickets.has(ticket)) {
      throw Error('ticket not valid, access denied!')
    }
    if (service) {
      if (!service.isReady()) {
        throw Error(`service ${service.getName()} not ready, its on ${service.getStatus()} stage!`)
      }
      // for audit sys, only if it enabled to reduce load
      if (this.reportsState.isAuditEnabled) {
        this.messagerBus('auditor', this.getAuditMessage(ticket, serviceName, action, service, args))
      }
      return service.doExecute(action, ...args)
    }
  }

  /*
   * Prepare audit message
   */
  getAuditMessage (ticket, serviceName, action, service, args) {
    let callType = service.getExportFnType(action)
    let layerName = this.getName()
    let serviceAcl = service.getAcl()

    return {
      message: `${ticket.callerLayer}.${ticket.callerName} (group |${ticket.callerGroup}|) call ${layerName}.${serviceName}.${action} (mask ${serviceAcl}, type |${callType}|)`,
      operation: 'execute',
      caller: {
        layer: ticket.callerLayer,
        name: ticket.callerName,
        group: ticket.callerGroup
      },
      target: {
        layer: layerName,
        name: serviceName,
        action: action,
        mask: serviceAcl,
        type: callType
      },
      args
    }
  }

  /*
   * Report about whole layer ready
   */
  isReady () {
    return Object.keys(this.registeredWorkers).every((workerName) => {
      return this.registeredWorkers[workerName].isReady()
    }, this)
  }
}

export default Layer
