/*
 * Antinit base lib
 */
import Layer from './layer'
import groupsLevel from './groups_levels'
import Keeper from './plugins/keeper'

const ANTINITE_SYSTEM_NAME = 'AntiniteSystem'
const ANTINITE_SERVICE_EXECUTE_FN = Symbol('Antinite service execute function')

let AntiniteAuditor, AntiniteDebugger
let reportsState = {
  isAuditEnabled: false, // shared by refs, instantly update
  isDebuggEnabled: false
}

// helpers points
let auditorProcess = new Keeper()
let debuggerProcess = new Keeper()

// common exchange point for all (in one process)
let layersExchanger = {}

/*
 * Main lib
 */
class Antinite {
  constructor (layerName) {
    this.layerName = layerName
    this.layer = new Layer(layerName, {
      globalLookUp: this.globalLookUp.bind(this),
      pendingRestarter: this.pendingRestarter.bind(this),
      messagerBus: this.messagerProcessor.bind(this),
      reportsState
    })
    layersExchanger[layerName] = this.layer
  }

  /*
   * Add services
   *
   * just proxy
   */
  addServices (servicesList) {
    this.layer.addWorkers(servicesList)
    return this
  }

  /*
   * Look up for all layers
   */
  globalLookUp (callerLayer, callerName, serviceName, action) {
    let res, layer

    Object.keys(layersExchanger).some((layerName) => {
      layer = layersExchanger[layerName]
      if (layerName === this.layerName) {
        return
      }
      res = layer.serviceLookup(callerLayer, callerName, groupsLevel.other, serviceName, action)
      return res
    }, this)

    return res
  }

  /*
   * Restart resolving pended workers for all layers
   *
   * if somewere dependencies pended
   */
  pendingRestarter () {
    let layer

    Object.keys(layersExchanger).forEach((layerName) => {
      layer = layersExchanger[layerName]
      if (layerName === this.layerName) {
        return
      }
      layer.repeatResolving()
    }, this)
  }

  /*
   * Process messages from layers and workers
   */
  messagerProcessor (topic, message) {
    switch (topic) {
      case 'auditor':
        auditorProcess.saveMessage(message)
        return
      case 'debugger':
        debuggerProcess.saveMessage(message)
        return
      default:
        throw Error(`Topic ${topic} not in processing list!`)
    }
  }
}

/*
 * System helper for `system` acess rights
 */
class AntiniteSystem {
  constructor (name) {
    this.name = name
    this.grantedItem = {}
  }

  /*
   * Execute command with `system` rights
   */
  execute (layerName, serviceName, action, ...args) {
    let service
    let layer = layersExchanger[layerName]
    let fullPath = this.getKeyForGrantedItems(layerName, serviceName, action)
    let grantedItem = this.grantedItem[fullPath]

    // shortcut for resolved early functions
    if (grantedItem) {
      return grantedItem.layer.executeAction(grantedItem.ticket, serviceName, action, ...args)
    }
    if (!layer) {
      throw Error(`unknown layer ${layer}`)
    }
    if (!layer.isServiceRegistered(serviceName)) {
      throw Error(`unknown service ${serviceName} at layer ${layer} `)
    }
    service = layer.serviceLookup('system', this.getName(), groupsLevel.system, serviceName, action)
    if (!service) {
      throw Error(`cant access action ${action} at service ${serviceName} at layer ${layer}`)
    }
    this.grantedItem[fullPath] = service
    return layer.executeAction(service.ticket, serviceName, action, ...args)
  }

  /*
   * Check ALL requres resolved in ALL layers
   */
  ensureAllIsReady () {
    let layer

    Object.keys(layersExchanger).forEach((layerName) => {
      layer = layersExchanger[layerName]
      if (!layer.isReady()) {
        throw Error(`Layer '${layerName}' not ready, halt!`)
      }
    }, this)
  }

  /*
   * Return current system service name
   */
  getName () {
    if (this.name) {
      return this.name
    } else {
      return ANTINITE_SYSTEM_NAME
    }
  }

  /*
   * Make one-string text key presentation
   *
   * to speed up granted acess look up in flat dictionary
   */
  getKeyForGrantedItems (layerName, serviceName, action) {
    return `${layerName}|${serviceName}|${action}`
  }
}

/*
 * Base class for Antinit Services
 *
 * (service MAY not inhered this while not use `require` block)
 */
class AntiniteService {
  constructor (options) {
    this[ANTINITE_SERVICE_EXECUTE_FN] = () => { throw Error('No look up function is set, cant call requered !') }
  }

  /*
   * Setup execution function ref
   *
   * to priocess request with requred service
   */
  setExecuteFn (executeFn) {
    this[ANTINITE_SERVICE_EXECUTE_FN] = executeFn
  }

  /*
   * Make request to requred service
   */
  doRequireCall (service, action, ...args) {
    return this[ANTINITE_SERVICE_EXECUTE_FN](service, action, ...args)
  }
}

/*
 * Audit log point
 *
 * not a class, system wide
 */
AntiniteAuditor = {
  /*
   * Audit enabler/disabler
   */
  setMode: (isOn) => {
    reportsState.isAuditEnabled = isOn
  },

  /*
   * Get audit data
   */
  getData: () => {
    return auditorProcess.getMessages()
  },

  /*
   * Setup audit log size
   */
  setLogSize: (size) => {
    auditorProcess.setMaxStorageSize(size)
  }
}

/*
 * Debug log point
*
 * not a class, system wide
 */
AntiniteDebugger = {
  /*
   * Debug enabler/disabler
   */
  setMode: (isOn) => {
    reportsState.isDebuggEnabled = isOn
  },

  /*
   * Get debugger data
   */
  getData: () => {
    return debuggerProcess.getMessages()
  },

  /*
   * Setup debugger log size
   */
  setLogSize: (size) => {
    debuggerProcess.setMaxStorageSize(size)
  }
}

export {Antinite as Layer, AntiniteSystem as System, AntiniteService as Service, AntiniteAuditor as Auditor, AntiniteDebugger as Debugger}
