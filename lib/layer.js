'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Layer for services
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helper = require('./helper');

var _groups_levels = require('./groups_levels');

var _groups_levels2 = _interopRequireDefault(_groups_levels);

var _worker = require('./worker');

var _worker2 = _interopRequireDefault(_worker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Layer = function () {
  function Layer(layerName, _ref) {
    var globalLookUp = _ref.globalLookUp;
    var pendingRestarter = _ref.pendingRestarter;
    var messagerBus = _ref.messagerBus;
    var reportsState = _ref.reportsState;

    _classCallCheck(this, Layer);

    this.name = layerName;
    this.globalLookUp = globalLookUp; // global look up ref
    this.pendingRestarter = pendingRestarter; // pending look up ref
    this.messagerBus = messagerBus;
    this.reportsState = reportsState;
    this.registeredWorkers = {};
    this.grantedTickets = new WeakSet(); // storage for granted tickets to services at resolving stage
    this.localLookUp = this.localLookUp.bind(this);
    this.isLayerLegacy = false;
  }

  _createClass(Layer, [{
    key: 'getName',
    value: function getName() {
      return this.name;
    }

    /*
     * Add some services to layer
     */

  }, {
    key: 'addWorkers',
    value: function addWorkers(workersList) {
      if (!Array.isArray(workersList)) {
        throw TypeError('Workers list must be an Array, halt!');
      }
      workersList.forEach(this.addWorker, this);
      // first service may have last one as require - just retry
      this.repeatResolving();
      this.pendingRestarter();
      // for log sys
      if (this.reportsState.isDebuggEnabled) {
        this.messagerBus('debugger', { message: 'OK: layer |' + this.name + '| add workers' });
      }
      return this;
    }

    /*
     * Restart dependencies
     */

  }, {
    key: 'repeatResolving',
    value: function repeatResolving() {
      var _this = this;

      var worker = void 0;

      Object.keys(this.registeredWorkers).forEach(function (workerName) {
        worker = _this.registeredWorkers[workerName];
        if (!worker.isReady()) {
          worker.doResolvePending();
        }
      }, this);
    }

    /*
     * Add one service to layer
     */

  }, {
    key: 'addWorker',
    value: function addWorker(workerDesc) {
      var currentWorker = void 0,
          workerName = void 0;

      if (!((0, _helper.has)(workerDesc, 'name') && (0, _helper.has)(workerDesc, 'service') && (0, _helper.has)(workerDesc, 'acl'))) {
        throw TypeError('Wrong worker description, halt!');
      }
      workerDesc.layerName = this.getName();
      currentWorker = new _worker2.default(workerDesc);
      workerName = currentWorker.getName();
      if (this.registeredWorkers[workerName]) {
        throw Error('Service |' + workerName + '| already added, halt!');
      }
      currentWorker.setLookUp(this.localLookUp.bind(this));
      currentWorker.setMessagerBus(this.messagerBus);
      currentWorker.setReportsState(this.reportsState);
      this.registeredWorkers[workerName] = currentWorker;
      currentWorker.prepareModule();
    }
  }, {
    key: 'localLookUp',
    value: function localLookUp(callerName, serviceName, action) {
      var res = void 0;
      var callerLayer = this.getName();

      res = this.serviceLookup(callerLayer, callerName, _groups_levels2.default.group, serviceName, action);
      if (!res) {
        res = this.globalLookUp(callerLayer, callerName, serviceName, action);
      }
      return res;
    }
  }, {
    key: 'isServiceRegistered',
    value: function isServiceRegistered(serviceName) {
      return !!this.registeredWorkers[serviceName];
    }

    /*
     * Local look up (at layer)
     */

  }, {
    key: 'serviceLookup',
    value: function serviceLookup(callerLayer, callerName, callerGroup, serviceName, action) {
      var message = void 0;
      var ticket = { callerGroup: callerGroup, callerName: callerName, callerLayer: callerLayer };
      var service = this.registeredWorkers[serviceName];

      if (service) {
        message = 'for ' + callerLayer + '.' + callerName + ' (group |' + callerGroup + '|) to ' + this.getName() + '.' + serviceName + '.' + action + ' (mask ' + service.getAcl() + ', type |' + service.getExportFnType(action) + '|)';
        if (service.isActionGranted(callerGroup, action)) {
          // for log sys
          if (this.reportsState.isDebuggEnabled) {
            this.messagerBus('debugger', { message: 'OK: access granted ' + message });
          }
          this.grantedTickets.add(ticket);
          // return ticket AND layer in duty to ASAP execution
          return { ticket: ticket, layer: this };
        } else {
          if (!service.isActionExists(action)) {
            // for log sys
            if (this.reportsState.isDebuggEnabled) {
              this.messagerBus('debugger', { message: 'FAIL: no action |' + action + '| at ' + this.getName() + '.' + serviceName });
            }
            console.warn('-  (x) No action |' + action + '| at ' + this.getName() + '.' + serviceName);
          } else {
            // for log sys
            if (this.reportsState.isDebuggEnabled) {
              this.messagerBus('debugger', { message: 'FAIL: access denied ' + message });
            }
            console.warn('-  (x) Access denied ' + message);
          }
        }
      }
    }

    /*
     * Execute action, if caller has valid ticket
     */

  }, {
    key: 'executeAction',
    value: function executeAction(ticket, serviceName, action) {
      var service = this.registeredWorkers[serviceName];

      if (!this.grantedTickets.has(ticket)) {
        throw Error('ticket not valid, access denied!');
      }
      if (service) {
        if (!service.isReady()) {
          throw Error('service |' + service.getName() + '| not ready, its on |' + service.getStatus() + '| stage!');
        }
        // for audit sys, only if it enabled to reduce load

        for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
          args[_key - 3] = arguments[_key];
        }

        if (this.reportsState.isAuditEnabled) {
          this.messagerBus('auditor', this.getAuditMessage(ticket, serviceName, action, service, args));
        }
        return service.doExecute.apply(service, [action].concat(args));
      }
    }

    /*
     * Prepare audit message
     */

  }, {
    key: 'getAuditMessage',
    value: function getAuditMessage(ticket, serviceName, action, service, args) {
      var callType = service.getExportFnType(action);
      var layerName = this.getName();
      var serviceAcl = service.getAcl();

      return {
        message: ticket.callerLayer + '.' + ticket.callerName + ' (group |' + ticket.callerGroup + '|) call ' + layerName + '.' + serviceName + '.' + action + ' (mask ' + serviceAcl + ', type |' + callType + '|)',
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
        args: args
      };
    }

    /*
     * Return all services in layer
     */

  }, {
    key: 'getServices',
    value: function getServices() {
      return this.registeredWorkers;
    }

    /*
     * Report about whole layer ready
     */

  }, {
    key: 'isReady',
    value: function isReady() {
      var _this2 = this;

      return Object.keys(this.registeredWorkers).every(function (workerName) {
        return _this2.registeredWorkers[workerName].isReady();
      }, this);
    }

    /*
     * Mark layer as legacy
     */

  }, {
    key: 'markAsLegacy',
    value: function markAsLegacy() {
      this.isLayerLegacy = true;
    }

    /*
     * Report about legacy status
     */

  }, {
    key: 'isLegacy',
    value: function isLegacy() {
      return this.isLayerLegacy;
    }
  }]);

  return Layer;
}();

exports.default = Layer;