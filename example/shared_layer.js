'use strict';

var _ = require('..');

var _bar_service = require('./bar_service');

var _bar_service2 = _interopRequireDefault(_bar_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// second layer file aka 'shared_layer'

var LAYER_NAME = 'shared';
var SERVICES = [{
  name: 'BarService',
  service: new _bar_service2.default(),
  acl: 764
}];

var layerObj = new _.Layer(LAYER_NAME);
layerObj.addServices(SERVICES);