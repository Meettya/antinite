'use strict';

var _ = require('../../..');

var _config_reader = require('./config_reader');

var _config_reader2 = _interopRequireDefault(_config_reader);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LAYER_NAME = 'shared'; /*
                            * Просто индекс, описывающий подключаемые модули в рамках уровня (слоя)
                            */

var SERVICES = [{
  name: 'ConfigReader',
  service: new _config_reader2.default(),
  acl: 751
}, {
  name: 'Logger',
  service: new _logger2.default(),
  acl: 762
}];

var layerObj = new _.Layer(LAYER_NAME);
layerObj.addServices(SERVICES);