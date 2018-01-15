'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// first service file aka 'foo_service'

var FooService = function () {
  function FooService() {
    _classCallCheck(this, FooService);
  }

  _createClass(FooService, [{
    key: 'getServiceConfig',
    value: function getServiceConfig() {
      // IMPORTANT - convented function name for service config
      return {
        require: {
          BarService: ['getBar'] // this is external dependency
        },
        export: {
          execute: ['doFoo'] // this action will exported as 'execute' type (all types - 'execute', 'write', 'read')
        },
        options: { // options for service
          injectRequire: true // inject require part to class itsels
        }
      };
    }
  }, {
    key: 'doFoo',
    value: function doFoo(where) {
      // always available require call 
      var bar = this.doRequireCall('BarService', 'getBar'); // call to remote service, convented function name
      // or with `options.injectRequire` = true
      var bars = this.BarService.getBar();

      return where + ' ' + bar + ' and foo and ' + bars;
    }
  }]);

  return FooService;
}();

exports.default = FooService;