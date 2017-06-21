'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Antinit base lib
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Debugger = exports.Auditor = exports.Service = exports.System = exports.Layer = undefined;

var _layer = require('./layer');

var _layer2 = _interopRequireDefault(_layer);

var _groups_levels = require('./groups_levels');

var _groups_levels2 = _interopRequireDefault(_groups_levels);

var _keeper = require('./plugins/keeper');

var _keeper2 = _interopRequireDefault(_keeper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ANTINITE_SYSTEM_NAME = 'AntiniteSystem';
var ANTINITE_SERVICE_EXECUTE_FN = Symbol('Antinite service execute function');

var AntiniteAuditor = void 0,
    AntiniteDebugger = void 0;
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
          throw Error('Topic ' + topic + ' not in processing list!');
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
        throw Error('unknown service ' + serviceName + ' at layer ' + layer + ' ');
      }
      service = layer.serviceLookup('system', this.getName(), _groups_levels2.default.system, serviceName, action);
      if (!service) {
        throw Error('cant access action ' + action + ' at service ' + serviceName + ' at layer ' + layer);
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
          throw Error('Layer \'' + layerName + '\' not ready, halt!');
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
 * Base class for Antinit Services
 *
 * (service MAY not inhered this while not use `require` block)
 */


var AntiniteService = function () {
  function AntiniteService(options) {
    _classCallCheck(this, AntiniteService);

    this[ANTINITE_SERVICE_EXECUTE_FN] = function () {
      throw Error('No look up function is set, cant call requered !');
    };
  }

  /*
   * Setup execution function ref
   *
   * to priocess request with requred service
   */


  _createClass(AntiniteService, [{
    key: 'setExecuteFn',
    value: function setExecuteFn(executeFn) {
      this[ANTINITE_SERVICE_EXECUTE_FN] = executeFn;
    }

    /*
     * Make request to requred service
     */

  }, {
    key: 'doRequireCall',
    value: function doRequireCall(service, action) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      return this[ANTINITE_SERVICE_EXECUTE_FN].apply(this, [service, action].concat(args));
    }
  }]);

  return AntiniteService;
}();

/*
 * Audit log point
 *
 * not a class, system wide
 */


exports.Auditor = AntiniteAuditor = {
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
};

exports.Layer = Antinite;
exports.System = AntiniteSystem;
exports.Service = AntiniteService;
exports.Auditor = AntiniteAuditor;
exports.Debugger = AntiniteDebugger;