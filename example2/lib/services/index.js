'use strict';

var _ = require('../../..');

var _http_connector = require('./http_connector');

var _http_connector2 = _interopRequireDefault(_http_connector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Просто индекс, описывающий подключаемые модули в рамках уровня (слоя)
 */
var LAYER_NAME = 'services';
var SERVICES = [{
  name: 'HttpConnector',
  service: new _http_connector2.default(),
  acl: 777
}];

var layerObj = new _.Layer(LAYER_NAME);
layerObj.addServices(SERVICES);