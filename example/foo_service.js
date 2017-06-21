'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('..');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // first service file aka 'foo_service'


// MUST extend Antinit Service if service use 'require' section
var FooService = function (_Service) {
  _inherits(FooService, _Service);

  function FooService(props) {
    _classCallCheck(this, FooService);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(FooService).call(this, props));
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
      var bar = this.doRequireCall('BarService', 'getBar' // call to remote service, convented function name

      );return where + ' ' + bar + ' and foo';
    }
  }]);

  return FooService;
}(_.Service);

exports.default = FooService;