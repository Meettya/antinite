'use strict';

var _ = require('..');

var _foo_service = require('./foo_service');

var _foo_service2 = _interopRequireDefault(_foo_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// first layer file aka 'services_layer'

var LAYER_NAME = 'service'; // domain for services aka layer
var SERVICES = [// services list
{
  name: 'FooService', // exported service name
  service: new _foo_service2.default(), // service object
  acl: 711 // service rights (for system/layer/other)
}];

var layerObj = new _.Layer(LAYER_NAME); // register layer
layerObj.addServices(SERVICES // fullfill with services
);