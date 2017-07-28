'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helper = require('./helper');

/*
 * Check all options are valid
 */
var checkOptions = function checkOptions(options) {
  if (!((0, _helper.has)(options, 'layer') && (0, _helper.has)(options, 'name') && (0, _helper.has)(options, 'service') && (0, _helper.has)(options, 'acl'))) {
    throw TypeError('Wrong legacy service registration, halt!');
  }
  if (!(0, _helper.has)(options.service, 'getServiceConfig')) {
    throw TypeError('Wrong legacy service, |getServiceConfig| not found, halt!');
  }
}; /*
    * Legacy helpers suite
    */
exports.default = { checkOptions: checkOptions };