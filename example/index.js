/*
 * Точка старта всего проекта
 * 
 * по факту - просто перечисление реализованных слоев сервисов
 */

var Antinite = require('..');
var AntiniteDebugger = Antinite.AntiniteDebugger;

// нам нужен включенный режим ДО начала разрешения всех зависимостей
new AntiniteDebugger().setMode(true)

var services = require('./lib/services');
var shared = require('./lib/shared');
var system = require('./lib/system');


var antiniteSys = new Antinite.AntiniteSystem('mainSystem');
var auditAntiniteSys = new Antinite.AntiniteSystem('auditSystem');

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

