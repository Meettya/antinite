// main start point aka 'index'
import { System, Auditor, Debugger } from '..'

// important turn on Debugger BEFORE load layers
Debugger.setMode(true)
Auditor.setMode(true)

// load layers, in ANY orders
import './services_layer'
import './shared_layer'

let antiniteSys = new System('mainSystem') // create system object to access any exported actions (system do 'require *', kind of)
let res = antiniteSys.execute('service', 'FooService', 'doFoo', 'here') // system may call any service (BUT only if service rights allow it)

console.log(res) // `here its bar and foo and its bar`

console.log('-Auditor data-')
console.log(Auditor.getData())

console.log('-Debugger data-')
console.log(Debugger.getData())
