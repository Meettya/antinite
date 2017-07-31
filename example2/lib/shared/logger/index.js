'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Простой модуль логирования
 */

var Logger = function () {
  function Logger() {
    _classCallCheck(this, Logger);
  }

  _createClass(Logger, [{
    key: 'getServiceConfig',

    // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно
    value: function getServiceConfig() {
      return {
        export: {
          write: ['log']
        }
      };
    }
  }, {
    key: 'log',
    value: function log() {
      var _console;

      (_console = console).log.apply(_console, arguments);
    }
  }]);

  return Logger;
}();

exports.default = Logger;