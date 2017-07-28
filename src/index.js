/*
 * Antinit base lib
 */
import Layer from './layer'
import groupsLevel from './groups_levels'
import Keeper from './plugins/keeper'
import SystemGraph from './system_graph'
import legacyHelper from './legacy_helper'

const ANTINITE_SYSTEM_NAME = 'AntiniteSystem'

let AntiniteAuditor, AntiniteDebugger, AntiniteToolkit, AntiniteLegacy
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
    this.doCheckName(layerName)
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
   * Test layer name
   *
   * Not allowed undefined, empty or doubled names
   */
  doCheckName (layerName) {
    if (layerName === undefined || layerName === null || layerName === '') {
      throw Error('Layer must be named, halt!')
    }
    if (typeof layerName !== 'string') {
      throw TypeError('Layer name must be a string')
    }
    if (layersExchanger[layerName]) {
      throw Error(`Layer |${layerName}| already exists, doubles not allowed, halt!`)
    }
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
        throw Error(`Topic |${topic}| not in processing list!`)
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
      throw Error(`unknown service |${layer.getName()}.${serviceName}|`)
    }
    service = layer.serviceLookup('system', this.getName(), groupsLevel.system, serviceName, action)
    if (!service) {
      throw Error(`cant access action |${layer.getName()}.${serviceName}.${action}|`)
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
        throw Error(`Layer |${layerName}| not ready, halt!`)
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
 * Legacy helper
 *
 * not a class, do not use at production
 */
AntiniteLegacy = {
  /*
   * Register service
   */
  register: (options) => {
    // fast check options
    legacyHelper.checkOptions(options)
    if(!layersExchanger[options.layer]){
      debuggerProcess.saveMessage({message: `Create LEGACY layer |${options.layer}|`})
      new Antinite(options.layer)
      layersExchanger[options.layer].markAsLegacy()
    }
    debuggerProcess.saveMessage({message: `Add LEGACY service |${options.layer}.${options.name}|`})
    // add legacy service
    options.isLegacy = true
    layersExchanger[options.layer].addWorkers([options])
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

/*
 * Toolkit for tests only!!!
 *
 * DO NOT USE IT IN WORKING CODE
 */
AntiniteToolkit = {
  /*
   * Wipe all Antinite state
   *
   * !!!use it for test only!!!
   * IMPORTANT - System cached 'execute' and if it not re-create - it may call dropped layers (it has link at granted access)
   */
  _WIPE_ALL_: () => {
    // drop reports states
    reportsState.isAuditEnabled = false
    reportsState.isDebuggEnabled = false
    // wipe loggers
    auditorProcess = new Keeper()
    debuggerProcess = new Keeper()
    // drop all layers
    layersExchanger = {}
  },

  /*
   * Return all registered services properties
   *
   * Data for all layers for all services to visualise system components
   */
  getSystemGraph: () => {
    return SystemGraph.getData(layersExchanger)
  }
}

export {
  Antinite as Layer,
  AntiniteSystem as System,
  AntiniteAuditor as Auditor,
  AntiniteDebugger as Debugger,
  AntiniteLegacy as Legacy,
  AntiniteToolkit}
