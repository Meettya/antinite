'use strict';

var _ = require('../../..');

var _2 = _interopRequireDefault(_);

var _config_reader = require('./config_reader');

var _config_reader2 = _interopRequireDefault(_config_reader);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LAYER = 'shared'; /*
                       * Просто индекс, описывающий подключаемые модули в рамках уровня (слоя)
                       */

var WORKERS = [{
  name: 'ConfigReader',
  service: new _config_reader2.default(),
  acl: 751
}, {
  name: 'Logger',
  service: new _logger2.default(),
  acl: 762
}];

var antiniteObj = new _2.default(LAYER);
antiniteObj.addWorkers(WORKERS);