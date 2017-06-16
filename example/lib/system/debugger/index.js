'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Модуль аудита
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../../../..');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Debugger = function () {
  function Debugger(props) {
    _classCallCheck(this, Debugger);

    this.antiniteDebugger = new _.AntiniteDebugger('Debugger');
  }

  // пока это будет тут, позднее возможно перенесем в конфиг, но это не точно


  _createClass(Debugger, [{
    key: 'getWorkerConfig',
    value: function getWorkerConfig() {
      return {
        export: {
          read: ['getData'],
          execute: ['startDebug', 'stopDebug']
        }
      };
    }
  }, {
    key: 'startDebug',
    value: function startDebug() {
      this.antiniteDebugger.setMode(true);
    }
  }, {
    key: 'stopDebug',
    value: function stopDebug() {
      this.antiniteDebugger.setMode(false);
    }
  }, {
    key: 'getData',
    value: function getData() {
      return this.antiniteDebugger.getData();
    }
  }]);

  return Debugger;
}();

exports.default = Debugger;