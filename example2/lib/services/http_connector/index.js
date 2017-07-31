'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Модуль соединения по HTTP
 */

var HttpConnector = function () {
  function HttpConnector(props) {
    _classCallCheck(this, HttpConnector);

    this.isOpened = false;
  }

  _createClass(HttpConnector, [{
    key: 'getServiceConfig',
    value: function getServiceConfig() {
      return {
        require: {
          Logger: ['log'],
          ConfigReader: ['read']
        },
        export: {
          read: ['getStatus'],
          write: ['sendData'],
          execute: ['open', 'close']
        }
      };
    }
  }, {
    key: 'open',
    value: function open() {
      this.doRequireCall('ConfigReader', 'read', 'http_connector_config');
      this.isOpened = true;
    }
  }, {
    key: 'close',
    value: function close() {
      this.isOpened = false;
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      return this.isOpened;
    }
  }, {
    key: 'sendData',
    value: function sendData(message) {
      this.doRequireCall('Logger', 'log', '!!! HttpConnector', 'call shared service from another layer!!!', message);
      console.log(message);
    }
  }]);

  return HttpConnector;
}();

exports.default = HttpConnector;