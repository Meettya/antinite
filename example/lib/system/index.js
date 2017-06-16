'use strict';

var _ = require('../../..');

var _2 = _interopRequireDefault(_);

var _auditor = require('./auditor');

var _auditor2 = _interopRequireDefault(_auditor);

var _debugger = require('./debugger');

var _debugger2 = _interopRequireDefault(_debugger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LAYER = 'system'; /*
                       * Просто индекс, описывающий подключаемые модули в рамках уровня (слоя)
                       */

var WORKERS = [{
  name: 'Auditor',
  service: new _auditor2.default(),
  acl: 744
}, {
  name: 'Debugger',
  service: new _debugger2.default(),
  acl: 744
}];

var antiniteObj = new _2.default(LAYER);
antiniteObj.addWorkers(WORKERS);