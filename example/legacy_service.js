'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Legacy Class
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('..');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LegacyService = function () {
  function LegacyService(props) {
    _classCallCheck(this, LegacyService);

    this.registerAsLegacy();
  }

  _createClass(LegacyService, [{
    key: 'registerAsLegacy',
    value: function registerAsLegacy() {
      _.Legacy.register({
        layer: 'services',
        name: 'LegacyService',
        service: this,
        acl: 777
      });
    }
  }, {
    key: 'getServiceConfig',
    value: function getServiceConfig() {
      return {
        require: {
          FooService: ['doFoo']
        },
        export: {
          read: ['getStatus']
        }
      };
    }
  }, {
    key: 'doQuiz',
    value: function doQuiz(arg) {
      return this.doRequireCall('FooService', 'doFoo', 'legacy');
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      return 'LegacyService';
    }
  }]);

  return LegacyService;
}();

exports.default = LegacyService;