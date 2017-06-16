'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../../../..');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Модуль соединения по HTTP
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var HttpConnector = function (_AntiniteService) {
  _inherits(HttpConnector, _AntiniteService);

  function HttpConnector(props) {
    _classCallCheck(this, HttpConnector);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(HttpConnector).call(this, props));

    _this.isOpened = false;
    return _this;
  }

  _createClass(HttpConnector, [{
    key: 'getWorkerConfig',
    value: function getWorkerConfig() {
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
}(_.AntiniteService);

exports.default = HttpConnector;