'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
        }
      };
    }
  }, {
    key: 'doFoo',
    value: function doFoo(where) {
      var bar = this.doRequireCall('BarService', 'getBar'); // call to remote service, convented function name

      return where + ' ' + bar + ' and foo';
    }
  }]);

  return FooService;
}();

exports.default = FooService;