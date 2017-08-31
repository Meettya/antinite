'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// service with .initService() aka 'baz_service'

var BazService = function () {
  function BazService() {
    _classCallCheck(this, BazService);

    this.storage = null; // internal field of class
  }

  _createClass(BazService, [{
    key: 'getServiceConfig',
    value: function getServiceConfig() {
      // IMPORTANT - convented function name for service config
      return {
        require: {
          BarService: ['getBar'] // this is external dependency
        },
        export: {
          execute: ['doBaz', 'doInjected'] // this action will exported as 'execute' type (all types - 'execute', 'write', 'read')
        },
        options: { // options for service
          injectRequire: true // inject require part to class itsels
        }
      };
    }
  }, {
    key: 'initService',
    value: function initService() {
      // IMPORTANT - convented function name for service init
      var bar = this.doRequireCall('BarService', 'getBar'); // call to remote service, convented function name

      this.storage = bar;
    }
  }, {
    key: 'doBaz',
    value: function doBaz() {
      // use inited data
      return 'baz inited with ' + this.storage;
    }
  }, {
    key: 'doInjected',
    value: function doInjected() {
      var bar = this.BarService.getBar();

      return 'injected ' + bar;
    }
  }]);

  return BazService;
}();

exports.default = BazService;