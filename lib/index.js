'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Antinit base lib
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AntiniteToolkit = exports.Legacy = exports.Debugger = exports.Auditor = exports.System = exports.Layer = undefined;

var _layer = require('./layer');

var _layer2 = _interopRequireDefault(_layer);

var _groups_levels = require('./groups_levels');

var _groups_levels2 = _interopRequireDefault(_groups_levels);

var _keeper = require('./plugins/keeper');

var _keeper2 = _interopRequireDefault(_keeper);

var _system_graph = require('./system_graph');

var _system_graph2 = _interopRequireDefault(_system_graph);

var _legacy_helper = require('./legacy_helper');

var _legacy_helper2 = _interopRequireDefault(_legacy_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ANTINITE_SYSTEM_NAME = 'AntiniteSystem';

var AntiniteAuditor = void 0,
    AntiniteDebugger = void 0,
    AntiniteToolkit = void 0,
    AntiniteLegacy = void 0;
var reportsState = {
  isAuditEnabled: false, // shared by refs, instantly update
  isDebuggEnabled: false

  // helpers points
};var auditorProcess = new _keeper2.default();
var debuggerProcess = new _keeper2.default();

// common exchange point for all (in one process)
var layersExchanger = {};

/*
 * Main lib
 */

var Antinite = function () {
  function Antinite(layerName) {
    _classCallCheck(this, Antinite);

    this.doCheckName(layerName);
    this.layerName = layerName;
    this.layer = new _layer2.default(layerName, {
      globalLookUp: this.globalLookUp.bind(this),
      pendingRestarter: this.pendingRestarter.bind(this),
      messagerBus: this.messagerProcessor.bind(this),
      reportsState: reportsState
    });
    layersExchanger[layerName] = this.layer;
  }

  /*
   * Add services
   *
   * just proxy
   */


  _createClass(Antinite, [{
    key: 'addServices',
    value: function addServices(servicesList) {
      this.layer.addWorkers(servicesList);
      return this;
    }

    /*
     * Test layer name
     *
     * Not allowed undefined, empty or doubled names
     */

  }, {
    key: 'doCheckName',
    value: function doCheckName(layerName) {
      if (layerName === undefined || layerName === null || layerName === '') {
        throw Error('Layer must be named, halt!');
      }
      if (typeof layerName !== 'string') {
        throw TypeError('Layer name must be a string');
      }
      if (layersExchanger[layerName]) {
        throw Error('Layer |' + layerName + '| already exists, doubles not allowed, halt!');
      }
    }

    /*
     * Look up for all layers
     */

  }, {
    key: 'globalLookUp',
    value: function globalLookUp(callerLayer, callerName, serviceName, action) {
      var _this = this;

      var res = void 0,
          layer = void 0;

      Object.keys(layersExchanger).some(function (layerName) {
        layer = layersExchanger[layerName];
        if (layerName === _this.layerName) {
          return;
        }
        res = layer.serviceLookup(callerLayer, callerName, _groups_levels2.default.other, serviceName, action);
        return res;
      }, this);

      return res;
    }

    /*
     * Restart resolving pended workers for all layers
     *
     * if somewere dependencies pended
     */

  }, {
    key: 'pendingRestarter',
    value: function pendingRestarter() {
      var _this2 = this;

      var layer = void 0;

      Object.keys(layersExchanger).forEach(function (layerName) {
        layer = layersExchanger[layerName];
        if (layerName === _this2.layerName) {
          return;
        }
        layer.repeatResolving();
      }, this);
    }

    /*
     * Process messages from layers and workers
     */

  }, {
    key: 'messagerProcessor',
    value: function messagerProcessor(topic, message) {
      switch (topic) {
        case 'auditor':
          auditorProcess.saveMessage(message);
          return;
        case 'debugger':
          debuggerProcess.saveMessage(message);
          return;
        default:
          throw Error('Topic |' + topic + '| not in processing list!');
      }
    }
  }]);

  return Antinite;
}();

/*
 * System helper for `system` acess rights
 */


var AntiniteSystem = function () {
  function AntiniteSystem(name) {
    _classCallCheck(this, AntiniteSystem);

    this.name = name;
    this.grantedItem = {};
  }

  /*
   * Execute command with `system` rights
   */


  _createClass(AntiniteSystem, [{
    key: 'execute',
    value: function execute(layerName, serviceName, action) {
      var service = void 0;
      var layer = layersExchanger[layerName];
      var fullPath = this.getKeyForGrantedItems(layerName, serviceName, action);
      var grantedItem = this.grantedItem[fullPath];

      // shortcut for resolved early functions

      for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        args[_key - 3] = arguments[_key];
      }

      if (grantedItem) {
        var _grantedItem$layer;

        return (_grantedItem$layer = grantedItem.layer).executeAction.apply(_grantedItem$layer, [grantedItem.ticket, serviceName, action].concat(args));
      }
      if (!layer) {
        throw Error('unknown layer ' + layer);
      }
      if (!layer.isServiceRegistered(serviceName)) {
        throw Error('unknown service |' + layer.getName() + '.' + serviceName + '|');
      }
      service = layer.serviceLookup('system', this.getName(), _groups_levels2.default.system, serviceName, action);
      if (!service) {
        throw Error('cant access action |' + layer.getName() + '.' + serviceName + '.' + action + '|');
      }
      this.grantedItem[fullPath] = service;
      return layer.executeAction.apply(layer, [service.ticket, serviceName, action].concat(args));
    }

    /*
     * Check ALL requres resolved in ALL layers
     */

  }, {
    key: 'ensureAllIsReady',
    value: function ensureAllIsReady() {
      var layer = void 0;

      Object.keys(layersExchanger).forEach(function (layerName) {
        layer = layersExchanger[layerName];
        if (!layer.isReady()) {
          throw Error('Layer |' + layerName + '| not ready, halt!');
        }
      }, this);
    }

    /*
     * Return current system service name
     */

  }, {
    key: 'getName',
    value: function getName() {
      if (this.name) {
        return this.name;
      } else {
        return ANTINITE_SYSTEM_NAME;
      }
    }

    /*
     * Make one-string text key presentation
     *
     * to speed up granted acess look up in flat dictionary
     */

  }, {
    key: 'getKeyForGrantedItems',
    value: function getKeyForGrantedItems(layerName, serviceName, action) {
      return layerName + '|' + serviceName + '|' + action;
    }
  }]);

  return AntiniteSystem;
}();

/*
 * Legacy helper
 *
 * not a class, do not use at production
 */


exports.Legacy = AntiniteLegacy = {
  /*
   * Register service
   */
  register: function register(options) {
    // fast check options
    _legacy_helper2.default.checkOptions(options);
    if (!layersExchanger[options.layer]) {
      debuggerProcess.saveMessage({ message: 'Create LEGACY layer |' + options.layer + '|' });
      new Antinite(options.layer); // eslint-disable-line no-new
      layersExchanger[options.layer].markAsLegacy();
    }
    debuggerProcess.saveMessage({ message: 'Add LEGACY service |' + options.layer + '.' + options.name + '|' });
    // add legacy service
    options.isLegacy = true;
    layersExchanger[options.layer].addWorkers([options]);
  }

  /*
   * Audit log point
   *
   * not a class, system wide
   */
};exports.Auditor = AntiniteAuditor = {
  /*
   * Audit enabler/disabler
   */
  setMode: function setMode(isOn) {
    reportsState.isAuditEnabled = isOn;
  },

  /*
   * Get audit data
   */
  getData: function getData() {
    return auditorProcess.getMessages();
  },

  /*
   * Setup audit log size
   */
  setLogSize: function setLogSize(size) {
    auditorProcess.setMaxStorageSize(size);
  }

  /*
   * Debug log point
   *
   * not a class, system wide
   */
};exports.Debugger = AntiniteDebugger = {
  /*
   * Debug enabler/disabler
   */
  setMode: function setMode(isOn) {
    reportsState.isDebuggEnabled = isOn;
  },

  /*
   * Get debugger data
   */
  getData: function getData() {
    return debuggerProcess.getMessages();
  },

  /*
   * Setup debugger log size
   */
  setLogSize: function setLogSize(size) {
    debuggerProcess.setMaxStorageSize(size);
  }

  /*
   * Toolkit for tests only!!!
   *
   * DO NOT USE IT IN WORKING CODE
   */
};exports.AntiniteToolkit = AntiniteToolkit = {
  /*
   * Wipe all Antinite state
   *
   * !!!use it for test only!!!
   * IMPORTANT - System cached 'execute' and if it not re-create - it may call dropped layers (it has link at granted access)
   */
  _WIPE_ALL_: function _WIPE_ALL_() {
    // drop reports states
    reportsState.isAuditEnabled = false;
    reportsState.isDebuggEnabled = false;
    // wipe loggers
    auditorProcess = new _keeper2.default();
    debuggerProcess = new _keeper2.default();
    // drop all layers
    layersExchanger = {};
  },

  /*
   * Return all registered services properties
   *
   * Data for all layers for all services to visualise system components
   */
  getSystemGraph: function getSystemGraph() {
    return _system_graph2.default.getData(layersExchanger);
  }
};

exports.Layer = Antinite;
exports.System = AntiniteSystem;
exports.Auditor = AntiniteAuditor;
exports.Debugger = AntiniteDebugger;
exports.Legacy = AntiniteLegacy;
exports.AntiniteToolkit = AntiniteToolkit;