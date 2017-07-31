/*
 * Точка старта всего проекта
 * 
 * по факту - просто перечисление реализованных слоев сервисов
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
antiniteSys.execute('shared', 'Logger', 'log', 'one', 2, 'three')
auditAntiniteSys.execute('system', 'Auditor', 'stopAudit')
antiniteSys.execute('shared', 'Logger', 'log', 'Object.entries() returns an array whose elements are arrays corresponding to the enumerable property [key, value] pairs found directly upon object.')
var readRes = antiniteSys.execute('shared', 'ConfigReader', 'read', 'foo_conf')
var ReaderState = antiniteSys.execute('shared', 'ConfigReader', 'getStatus')

console.log('readRes')
console.log(readRes)
console.log('ReaderState')
console.log(ReaderState)

auditAntiniteSys.execute('system', 'Auditor', 'startAudit')




antiniteSys.execute('services', 'HttpConnector', 'open')
antiniteSys.execute('services', 'HttpConnector', 'sendData', 'data to send')

auditAntiniteSys.execute('system', 'Auditor', 'stopAudit')

var auditData = auditAntiniteSys.execute('system', 'Auditor', 'getData')
console.log('=====auditData======')
console.log(auditData)

var debugData = auditAntiniteSys.execute('system', 'Debugger', 'getData')
console.log('=====debugData======')
console.log(debugData)

