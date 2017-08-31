[![Join the chat at https://gitter.im/Meettya/antinite](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Meettya/antinite?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://secure.travis-ci.org/Meettya/antinite.png)](http://travis-ci.org/Meettya/antinite) [![Dependency Status](https://david-dm.org/Meettya/antinite.svg)](https://david-dm.org/Meettya/antinite) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# antinite

Antinite is a zero dependency lightweight nano-services framework inside one node process.

## Raison d'être:

Its will be necessary to have sort of [Seneca](http://senecajs.org/) or [Studio.js](https://github.com/ericholiveira/studio) framework inside one process (without numbers of process and costly interprocess interaction) AND with some kind of ACL-based access control. Also system should represent services interaction logs on demand.

## Features:

* Layers (domains) to arrange services to logical groups
* Services with explicit dependencies and exported function
* Auto-resolving for all services dependencies
* Available auto-init resolved services
* Services request audit on demand
* Extract current system graph on demand
* Legacy helper for lazy refactoring

## Install:

    npm install antinite

## Example:

![Diagram](https://github.com/Meettya/antinite/blob/master/doc/antinite_diagram.png?raw=true)

Short diagram to explain long code example

```javascript
// first service file aka 'foo_service'
class FooService {
  getServiceConfig () { // IMPORTANT - convented function name for service config
    return ({
      require: {
        BarService: ['getBar'] // this is external dependency
      },
      export: {
        execute: ['doFoo'] // this action will exported as 'execute' type (all types - 'execute', 'write', 'read')
      },
      options: { // options for service
        injectRequire : true // inject require part to class itsels
      }
    })
  }

  doFoo (where) {
    // always available require call 
    let bar = this.doRequireCall('BarService', 'getBar') // call to remote service, convented function name
    // or with `options.injectRequire` = true
    let bars = this.BarService.getBar()

    return `${where} ${bar} and foo and ${bars}`
  }
}

export default FooService
```

```javascript
// first layer file aka 'services_layer'

import { Layer } from 'antinite'
import FooService from './foo_service'

const LAYER_NAME = 'service' // domain for services aka layer
const SERVICES = [ // services list
  {
    name: 'FooService', // exported service name
    service: new FooService(), // service object
    acl: 711 // service rights (for system/layer/other)
  }
]

let layerObj = new Layer(LAYER_NAME) // register layer
layerObj.addServices(SERVICES) // fulfill with services
```

```javascript
// second service file aka 'bar_service'
class BarService {
  getServiceConfig () {
    return ({
      export: {
        read: ['getBar'] // this action will exported as 'read' type
      }
    })
  }

  getBar () {
    return 'its bar'
  }
}

export default BarService
```

```javascript
// second layer file aka 'shared_layer'

import { Layer } from 'antinite'
import BarService from './bar_service'

const LAYER_NAME = 'shared'
const SERVICES = [
  {
    name: 'BarService',
    service: new BarService(),
    acl: 764
  }
]

let layerObj = new Layer(LAYER_NAME)
layerObj.addServices(SERVICES)
```

```javascript
// main start point aka 'index'
import { System } from 'antinite'

// load layers, in ANY orders
import './services_layer'
import './shared_layer'

let antiniteSys = new System('mainSystem') // create system object to access any exported actions (system do 'require *', kind of)
let res = antiniteSys.execute('service', 'FooService', 'doFoo', 'here') // system may call any service (BUT only if service rights allow it)

console.log(res) // `here its bar and foo and its bar`
```

## Usage:

Antinite framework has some main parts - `Layer` and `System` and some helpers - `Legacy`, `Auditor`, `Debugger` and `AntiniteToolkit`.

Moreover antinite has **_service_** conception - any object, used in `Layer` as service, **MUST** declare configuration with `getServiceConfig` method and **MAY** declare `initService` to initialise service after all requires will be resolved and **MAY** use `this.doRequireCall()` to call other services - its will be injected at `Layer` init.

### Service

Antinite may use prepared object as **_service_** if it declare configuration. The are three reserved methods names `getServiceConfig`, `initService` and `doRequireCall`.

#### Declare configuration

```javascript
getServiceConfig() {
  return ({
    require: {
      BarService: ['getBar']
    },
    export: {
      execute: ['doFoo']
    },
    options: {
      injectRequire : true
    }
  })
}
```

Service must declare public methods at 'export' part and used actions from another services in 'require' part. 

Its may be some options for service, `injectRequire` allow to call actions from another services as part of service class, for example:

```javascript
// without injection
let one = this.doRequireCall('BarService', 'getBar', 2, 3)
// with injection
let two = this.BarService.getBar(2, 3)
```

Its looks better and represents smooth code.

**IMPORTANT!** Injection throw error if object already have field with same name as required service.

#### Service initialization

```javascript
// at service class constructor
constructor(){
  this.storage = null // internal field of class
}
// and fill it when service resolve all requires
initService() { // IMPORTANT - convented function name for service init
  let bar = this.doRequireCall('BarService', 'getBar') // call to remote service, now its ready

  this.storage = bar
}
```

Service may declare `initService` method at class to automatic execute it when all requires will be resolved but before all system will be ready.

**IMPORTANT!** do not change state of another services here, or hard to debug errors may accured here.

**IMPORTANT!** only synchronous function supported

#### Call required service

```javascript
var res = this.doRequireCall(serviceName, actionName, ...args)
```

Service may call other services by _serviceName_ and _actionName_ pair with any arguments, if destination service allow access.

**IMPORTANT!** Service may have 'group' or 'other' part of ACL in case of in same or in different layers with destination service is it.

**IMPORTANT!** At auto resolving process Antinite do call to **first granted** service action (at different layers may be services with some name and different access rights)

### Layer

Antinite use layers (or domains) to arrange same services and separate different.

#### Create layer object

```javascript
import { Layer } from 'antinite'

let layerObj = new Layer(layerName)
```
Create new named layer.

#### Add services to layer

```javascript
layerObj.addServices(SERVICES)
```

Add services list to layer

Services must be an array of object:

```javascript
[
  {
    name : 'FooService',
    service : new FooService(), 
    acl : 711
  },...
]
```

**IMPORTANT!** Service must be an **instance**, not class.

### System

#### Create system object

```javascript
import { System } from 'antinite'
let antiniteSys = new System('mainSystem')
```

Create Antinite System object with own access level.

**IMPORTANT!** System ACL always is 'system' (first digit).

#### Execute action

```javascript
let res = antiniteSys.execute(layerName, serviceName, actionName, ...args)
```

Do call to service action in particular layer with any arguments 

#### Сheck is system are ready

```javascript
antiniteSys.ensureAllIsReady()
```

Check all system (in current node process) to ensure all 'required' actions available (exists AND allowed to callers), otherwise throw an error.

### Legacy

To simplify legacy code refactoring to Antinite nano-services may be used `Legacy` helper

#### Get Legacy helper pointer

```javascript
import { Legacy } from 'antinite'
```

`Legacy` helper join `Layer` and **_service_** at one place. Class must represent `getServiceConfig()` as ordinary **_service_** AND call to `Legacy.register()`, as `Layer` do it, for example at object constructor.

```javascript
class LegacyService {
  constructor(props){
    this.registerAsLegacy()
  }

  registerAsLegacy() {
    Legacy.register(
      {
        layer: 'services',
        name : 'LegacyService',
        service: this,
        acl: 777
      }
    )
  }

  getServiceConfig() {
    return ({
      require: {
        Logger: ['log'],
        ConfigReader:['read']
      },
      export: {
        read: ['getStatus']
      }
    })
  }
```

At result `services.LegacyService` was registered with `getStatus` exported function.

**Limitations!** By design original `Layers` must be unique, therefore all `Layers` **MUST** be required **before** any legacy objects. 
Nevertheless `Legacy` object will be added to original layers or will be create new and `Legacy` objects will be add until services names are unique.

### Auditor

#### Get auditor pointer

```javascript
import { Auditor } from 'antinite'
```

Get Antinite Auditor pointer, not a object - due to optimization enhancements this system-wide (in current node process) item. 

Its used to get inter-services interaction log. 

#### Turn on/off audit

```javascript
Auditor.setMode(true)
```

Set system audit mode on(true) or off(false).

**IMPORTANT!** Due to optimization enhancements this system-wide (in current node process) flag.

#### Get audit log

```javascript
Auditor.getData()
```

Get audit log.

Example:

```json
[ { "message": "system.mainSystem (group |system|) call service.FooService.doFoo (mask 711, type |execute|)",
    "operation": "execute",
    "caller": { "layer": "system", "name": "mainSystem", "group": "system" },
    "target": 
     { "layer": "service",
       "name": "FooService",
       "action": "doFoo",
       "mask": 711,
       "type": "execute" },
    "args": [ "here" ],
    "id": 1,
    "timestamp": 1498051547810 },
  { "message": "service.FooService (group |other|) call shared.BarService.getBar (mask 764, type |read|)",
    "operation": "execute",
    "caller": { "layer": "service", "name": "FooService", "group": "other" },
    "target": 
     { "layer": "shared",
       "name": "BarService",
       "action": "getBar",
       "mask": 764,
       "type": "read" },
    "args": [],
    "id": 2,
    "timestamp": 1498051547811 } ]
```

#### Set audit log storage size

```javascript
Auditor.setLogSize(512)
```

Set auditor log storage size.

**IMPORTANT!** Due to optimization enhancements this system-wide (in current node process) flag.

### Debugger

#### Get debugger pointer

```javascript
import { Debugger } from antinite
```

Get Antinite Debugger pointer, not a object - due to optimization enhancements this system-wide (in current node process) item. 

Its used to get internal Antinite log to help maintenance services

#### Turn on/off debug

```javascript
Debugger.setMode(true)
```

Set system debug mode on(true) or off(false).

**IMPORTANT!** Due to optimization enhancements this system-wide (in current node process) flag.

**IMPORTANT!** To get all messages for 'require' resolving turn debugger on **before** import layers at main index.

#### Get debug log

```javascript
Debugger.getData()
```

Get debug log.

Example: 

```json
[ { "message": "OK: layer |service| add workers",
    "id": 1,
    "timestamp": 1498054839189 },
  { "message": "OK: access granted for service.FooService (group |other|) to shared.BarService.getBar (mask 764, type |read|)",
    "id": 2,
    "timestamp": 1498054839212 },
  { "message": "OK: layer |shared| add workers",
    "id": 3,
    "timestamp": 1498054839212 },
  { "message": "OK: access granted for system.mainSystem (group |system|) to service.FooService.doFoo (mask 711, type |execute|)",
    "id": 4,
    "timestamp": 1498054839213 } ]
```

#### Set debug log storage size

```javascript
Debugger.setLogSize(512)
```

Set debugger log storage size.

**IMPORTANT!** Due to optimization enhancements this system-wide (in current node process) flag.

### AntiniteToolkit

#### Get toolkit pointer

```javascript
import { AntiniteToolkit } from antinite
```

This service part for develop and debug

#### Get current system graph

```javascript
AntiniteToolkit.getSystemGraph()
```

Return current system graph like this

```json
[
  {
    "name": "shared",
    "isReady": true,
    "services": [
      {
        "name": "ConfigReader",
        "isReady": true,
        "acl": 751,
        "export": {
          "read": "execute",
          "getStatus": "read"
        },
        "require": [
          {
            "name": "Logger",
            "actions": {
              "log": {
                "isReady": true,
                "resolved": "shared"
              }
            }
          }
        ]
      },
      {
        "name": "Logger",
        "isReady": true,
        "acl": 762,
        "export": {
          "log": "write"
        },
        "require": []
      }
    ]
  },
  {
    "name": "system",
    "isReady": true,
    "services": [
      {
        "name": "Auditor",
        "isReady": true,
        "acl": 744,
        "export": {
          "getData": "read"...
        },
        "require": []
      }...
    ]
  }
]
```

This data may be used to visualize system, see [online example](https://meettya.github.io/antinite-visual/index.html), created by [Antinite Visual Toolkit](https://github.com/Meettya/antinite-visual).

Data structure is simply - layers (or domain) at top, then services and its configuration. The `isReady` flag indicate layer or service successfully resolve all requests. The `resolved` field at service require section point to layer, where action will be resolved.

## General Notes:

### ACL bits

| | x | w | wx | r | rx | rw | rwx |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |

### ACL digit position

| first | second | third |
| :---: | :---: | :---: |
| system | group | other |

'system' - access level for system calls (system call service 'Foo' at layer 'Bazz')

'group' - access level for calls in some layer (service 'Foo' and 'Bar' at layer 'Bazz')

'other' - access level for calls from other layers (service 'Foo' at layer 'Bazz' and service 'Qux' at layer 'Waldo')

### ACL example

`741` - system has read, write and execute rights, services in some layer - read only, services from other layers - execute only
