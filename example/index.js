'use strict';

var _ = require('..');

// important turn on Debugger BEFORE load layers
_.Debugger.setMode(true); // main start point aka 'index'
_.Auditor.setMode(true);

// load layers, in ANY orders
require('./services_layer');
require('./shared_layer');

var antiniteSys = new _.System('mainSystem'); // create system object to access any exported actions (system do 'require *', kind of)
var res = antiniteSys.execute('service', 'FooService', 'doFoo', 'here'); // system may call any service (BUT only if service rights allow it)

console.log(res); // `here its bar and foo and its bar`

console.log('-Auditor data-');
console.log(_.Auditor.getData());

console.log('-Debugger data-');
console.log(_.Debugger.getData());