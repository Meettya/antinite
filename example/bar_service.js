'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// second service file aka 'bar_service'

// MAY not to extend AntiniteService if NOT use 'require' section
var BarService = function () {
  function BarService(props) {
    _classCallCheck(this, BarService);
  }

  _createClass(BarService, [{
    key: 'getServiceConfig',
    value: function getServiceConfig() {
      return {
        export: {
          read: ['getBar'] // this action will exported as 'read' type
        }
      };
    }
  }, {
    key: 'getBar',
    value: function getBar() {
      return 'its bar';
    }
  }]);

  return BarService;
}();

exports.default = BarService;