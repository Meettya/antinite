'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Worker class
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _groups_levels = require('./groups_levels');

var _groups_levels2 = _interopRequireDefault(_groups_levels);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// service lifecycle stages
var WORKERS_STATES = {
  created: 'created',
  registered: 'registered',
  resolved: 'resolved',
  inited: 'inited',
  ready: 'ready'

  // export livels
};var WORKER_EXPORT_LIVELS = new Set(['read', 'write', 'execute']);

var Worker = function () {
  function Worker(_ref) {
    var name = _ref.name;
    var service = _ref.service;
    var acl = _ref.acl;

    _classCallCheck(this, Worker);

    this.name = name;
    this.service = service;
    this.acl = acl;
    this.state = WORKERS_STATES.created;
    this.exportDict = {};
    this.requireDict = {};
    this.requirePending = {};
    this.lookUpFn = this.zeroLookUp;
    this.messagerBus = function () {};
    this.reportsState = {};
    this.proxyUpcomingExecute = this.proxyUpcomingExecute.bind(this);
  }

  /*
   * Setup parent look up
   */


  _createClass(Worker, [{
    key: 'setLookUp',
    value: function setLookUp(lookUpFn) {
      var _this = this;

      this.lookUpFn = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return lookUpFn.apply(undefined, [_this.getName()].concat(args));
      };
    }

    /*
     * Setup parent messages bus
     */

  }, {
    key: 'setMessagerBus',
    value: function setMessagerBus(messagerBus) {
      this.messagerBus = messagerBus;
    }

    /*
     * Setup report state (to avoid unnided work)
     */

  }, {
    key: 'setReportsState',
    value: function setReportsState(reportsState) {
      this.reportsState = reportsState;
    }

    /*
     * Empty parent look up forbidden
     */

  }, {
    key: 'zeroLookUp',
    value: function zeroLookUp() {
      throw Error('No look up function is set, cant resolve dependencies!');
    }

    /*
     * Return worker name
     */

  }, {
    key: 'getName',
    value: function getName() {
      return this.name;
    }

    /*
     * Return worker status
     */

  }, {
    key: 'getStatus',
    value: function getStatus() {
      return this.state;
    }

    /*
     * Return worker ACL
     */

  }, {
    key: 'getAcl',
    value: function getAcl() {
      return this.acl;
    }

    /*
     * Detect is action available for caller
     */

  }, {
    key: 'isActionGranted',
    value: function isActionGranted(groupType, action) {
      var groupRights = this.getAclFor(groupType);
      var actionType = this.getExportFnType(action);

      return groupRights[actionType];
    }

    /*
     * Get group rights as dictionary
     */

  }, {
    key: 'getAclFor',
    value: function getAclFor(groupType) {
      var aclDigit = this.getAclPart(this.acl, groupType);

      return this.parseAclToDict(aclDigit);
    }

    /*
     * Worker prepare steps block
     */

  }, {
    key: 'prepareModule',
    value: function prepareModule(_ref2) {
      var layerName = _ref2.layerName;

      this.checkService(layerName);
      this.processPresenter();
      this.state = WORKERS_STATES.registered;
      this.processRequires();
      if (this.isRequireSolved()) {
        this.state = WORKERS_STATES.resolved;
        this.processInit();
      }
      return this;
    }

    /*
     * Steps to resolve pendings requires
     *
     * in case of some layer register
     */

  }, {
    key: 'doResolvePending',
    value: function doResolvePending() {
      if (!this.isRequireSolved()) {
        this.processPendingRequires();
      }
      if (this.isRequireSolved()) {
        this.state = WORKERS_STATES.resolved;
        this.processInit();
      }
      return this;
    }

    /*
     * Check service configuratin is correct
     */

  }, {
    key: 'checkService',
    value: function checkService(layerName) {
      var workerConfig = void 0;

      try {
        workerConfig = this.service.getServiceConfig();
      } catch (err) {
        console.warn('-  (x) Cant get config for ' + layerName + '.' + this.name + ', check it is class INSTANCE, not class itself!');
        throw Error(err);
      }

      if (!Reflect.has(workerConfig, 'export')) {
        throw TypeError('Wrong worker configuration, halt!');
      }
    }

    /*
     * Void rights dictionary
     */

  }, {
    key: 'getZeroAclDict',
    value: function getZeroAclDict() {
      return {
        read: false,
        write: false,
        execute: false
      };
    }

    /*
     * Get group ACL part
     */

  }, {
    key: 'getAclPart',
    value: function getAclPart(fullAcl, groupType) {
      // дополняем набор, справа, дабы неверно написанные права не поднимали уровень доступа ( например 7 - это права 700, а не 007)
      var fullAclStr = (fullAcl + '000').slice(0, 3);

      switch (groupType) {
        case _groups_levels2.default.system:
          return fullAclStr.charAt(0) | 0;
        case _groups_levels2.default.group:
          return fullAclStr.charAt(1) | 0;
        case _groups_levels2.default.other:
          return fullAclStr.charAt(2) | 0;
        default:
          return 0;
      }
    }

    /*
     * Translate ACL digit to rights dictionary
     */

  }, {
    key: 'parseAclToDict',
    value: function parseAclToDict(aclDigit) {
      var res = this.getZeroAclDict();

      switch (aclDigit) {
        case 1:
          res.execute = true;
          break;
        case 2:
          res.write = true;
          break;
        case 3:
          res.execute = true;
          res.write = true;
          break;
        case 4:
          res.read = true;
          break;
        case 5:
          res.execute = true;
          res.read = true;
          break;
        case 6:
          res.write = true;
          res.read = true;
          break;
        case 7:
          res.execute = true;
          res.write = true;
          res.read = true;
          break;
      }
      return res;
    }

    /*
     * Internal module prepare step
     *
     * reverse dictionary
     */

  }, {
    key: 'processPresenter',
    value: function processPresenter() {
      this.exportDict = this.getExportDict();
    }

    /*
     * Do require processing
     *
     * may fall if no module finded
     */

  }, {
    key: 'processRequires',
    value: function processRequires() {
      var _this2 = this;

      var lookUpRes = void 0,
          funcsList = void 0;
      var workerConfig = this.service.getServiceConfig();

      if (!Reflect.has(workerConfig, 'require')) {
        return;
      }

      Object.keys(workerConfig.require).forEach(function (service) {
        funcsList = workerConfig.require[service];
        if (!_this2.requireDict[service]) {
          _this2.requireDict[service] = {};
        }
        funcsList.forEach(function (funcName) {
          lookUpRes = _this2.lookUpFn(service, funcName);
          if (lookUpRes) {
            _this2.requireDict[service][funcName] = lookUpRes;
          } else {
            if (!_this2.requirePending[service]) {
              _this2.requirePending[service] = [];
            }
            _this2.requirePending[service].push(funcName);
          }
        }, _this2);
      }, this);
    }

    /*
     * Do pending require processing
     *
     * repeat pending if no module finded
     */

  }, {
    key: 'processPendingRequires',
    value: function processPendingRequires() {
      var _this3 = this;

      var toPending = void 0,
          lookUpRes = void 0,
          funcsList = void 0;

      Object.keys(this.requirePending).forEach(function (service) {
        toPending = [];
        funcsList = _this3.requirePending[service];
        funcsList.forEach(function (funcName, idx) {
          lookUpRes = _this3.lookUpFn(service, funcName);
          if (lookUpRes) {
            _this3.requireDict[service][funcName] = lookUpRes;
          } else {
            toPending.push(funcName);
          }
        }, _this3);
        // save new pending list
        _this3.requirePending[service] = toPending;
      }, this);
    }

    /*
     * Return is worker solved require block
     */

  }, {
    key: 'isRequireSolved',
    value: function isRequireSolved() {
      var _this4 = this;

      return Object.keys(this.requirePending).every(function (serviceName) {
        return _this4.requirePending[serviceName].length === 0;
      });
    }

    /*
     * Init worker server itself
     */

  }, {
    key: 'processInit',
    value: function processInit() {
      // if worker not use require it may not have setExecuteFn
      if (this.service.setExecuteFn) {
        this.service.setExecuteFn(this.proxyUpcomingExecute);
      }
      // HACK simplify states
      this.state = WORKERS_STATES.ready;
      return this;
    }

    /*
     * Proxy worker request to system
     */

  }, {
    key: 'proxyUpcomingExecute',
    value: function proxyUpcomingExecute(serviceName, action) {
      var _grantedItem$layer;

      var grantedItem = void 0;

      if (!this.requireDict[serviceName]) {
        throw Error('Unknown service ' + serviceName + ' called');
      }
      if (!this.requireDict[serviceName][action]) {
        throw Error('Unknown action ' + action + ' at service ' + serviceName + ' called');
      }
      grantedItem = this.requireDict[serviceName][action];

      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      return (_grantedItem$layer = grantedItem.layer).executeAction.apply(_grantedItem$layer, [grantedItem.ticket, serviceName, action].concat(args));
    }

    /*
     * Return is worker ready
     */

  }, {
    key: 'isReady',
    value: function isReady() {
      return this.state === WORKERS_STATES.ready;
    }

    /*
     * Return module export dictionary
     *
     * { functionName: type }
     */

  }, {
    key: 'getExportDict',
    value: function getExportDict() {
      var funcs = void 0;
      var result = {};
      var workerConfig = this.service.getServiceConfig();

      Object.keys(workerConfig.export).forEach(function (level) {
        funcs = workerConfig.export[level];
        if (!WORKER_EXPORT_LIVELS.has(level)) {
          throw SyntaxError('Unknown export level ' + level);
        }
        funcs.forEach(function (funcName) {
          result[funcName] = level;
        });
      });
      return result;
    }

    /*
     * Return function type
     */

  }, {
    key: 'getExportFnType',
    value: function getExportFnType(action) {
      return this.exportDict[action];
    }

    /*
     * Request proxy to service
     */

  }, {
    key: 'doExecute',
    value: function doExecute(action) {
      var _service;

      if (!Reflect.has(this.service, action)) {
        throw Error('service ' + this.name + ' hasnt action ' + action);
      }

      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      return (_service = this.service)[action].apply(_service, args);
    }
  }]);

  return Worker;
}();

exports.default = Worker;