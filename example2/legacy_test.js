/*
 * Legacy test suite
 */

var util = require('util');

var Antinite = require('..');
var AntiniteSystem = Antinite.System;
var Debugger = Antinite.Debugger;
var AntiniteToolkit = Antinite.AntiniteToolkit;

// нам нужен включенный режим ДО начала разрешения всех зависимостей
Debugger.setMode(true)

var services = require('./lib/services');
var shared = require('./lib/shared');
var system = require('./lib/system');

var LegacyClass = require('./lib/legacy').default;
var legacyObj = new LegacyClass();

console.log('<------ getSystemGraph')
console.log(util.inspect(AntiniteToolkit.getSystemGraph(), true, null, true))
console.log(JSON.stringify(AntiniteToolkit.getSystemGraph()))
console.log('>------ getSystemGraph')

var antiniteSys = new AntiniteSystem('mainSystem');
var auditAntiniteSys = new AntiniteSystem('auditSystem');

// убеждаемся что все готово
antiniteSys.ensureAllIsReady()

auditAntiniteSys.execute('system', 'Debugger', 'startDebug')
auditAntiniteSys.execute('system', 'Auditor', 'startAudit')

console.log('*test legacy obj may use antinit internal')
console.log(legacyObj.doQuiz('legacy'))

console.log('*test legacy obj register correct and may used at antinit')
console.log(antiniteSys.execute('services', 'LegacyService', 'getStatus'))

var auditData = auditAntiniteSys.execute('system', 'Auditor', 'getData')
console.log('=====auditData======')
console.log(auditData)

var debugData = auditAntiniteSys.execute('system', 'Debugger', 'getData')
console.log('=====debugData======')
console.log(debugData)