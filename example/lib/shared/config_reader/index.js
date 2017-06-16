'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../../../..');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Модуль, читающий конфиги
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * возможно будет кешировать и отслеживать изменения
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var ConfigReader = function (_AntiniteService) {
  _inherits(ConfigReader, _AntiniteService);

  function ConfigReader(props) {
    _classCallCheck(this, ConfigReader);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ConfigReader).call(this, props));
  }

  // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно


  _createClass(ConfigReader, [{
    key: 'getWorkerConfig',
    value: function getWorkerConfig() {
      return {
        require: {
          Logger: ['log']
        },
        export: {
          execute: ['read'],
          read: ['getStatus']
        }
      };
    }
  }, {
    key: 'read',
    value: function read(fileName) {
      this.doRequireCall('Logger', 'log', '!!! ConfigReader', 'read', fileName);
      return { foo: 'bar', bazz: 42 };
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      return { cached: 0 };
    }
  }]);

  return ConfigReader;
}(_.AntiniteService);

exports.default = ConfigReader;