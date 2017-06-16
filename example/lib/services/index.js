'use strict';

var _ = require('../../..');

var _2 = _interopRequireDefault(_);

var _http_connector = require('./http_connector');

var _http_connector2 = _interopRequireDefault(_http_connector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Просто индекс, описывающий подключаемые модули в рамках уровня (слоя)
 */

var LAYER = 'services';
var WORKERS = [{
  name: 'HttpConnector',
  service: new _http_connector2.default(),
  acl: 777
}];

var antiniteObj = new _2.default(LAYER);
antiniteObj.addWorkers(WORKERS);