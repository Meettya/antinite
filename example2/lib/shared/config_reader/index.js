'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* 
 * Модуль, читающий конфиги
 *
 * возможно будет кешировать и отслеживать изменения
 */

var ConfigReader = function () {
  function ConfigReader() {
    _classCallCheck(this, ConfigReader);
  }

  _createClass(ConfigReader, [{
    key: 'getServiceConfig',

    // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно
    value: function getServiceConfig() {
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
}();

exports.default = ConfigReader;