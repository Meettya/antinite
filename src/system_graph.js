/*
 * Build system graph for all layers
 */

let getData, getLayerData, processServicesData, getServiceData

getServiceData = (serviceObj) => {
  return {
    name: serviceObj.getName(),
    isReady: serviceObj.isReady(),
    isLegacy: serviceObj.isLegacy(),
    acl: serviceObj.getAcl(),
    export: serviceObj.getExportDict(),
    require: serviceObj.getRequireDict()
  }
}

processServicesData = (servicesDict) => {
  let res = []

  Object.keys(servicesDict).forEach((serviceName) => {
    res.push(getServiceData(servicesDict[serviceName]))
  })
  return res
}

getLayerData = (layerObj) => {
  return {
    name: layerObj.getName(),
    isReady: layerObj.isReady(),
    isLegacy: layerObj.isLegacy(),
    services: processServicesData(layerObj.getServices())
  }
}

getData = (layersExchanger) => {
  let res = []

  Object.keys(layersExchanger).forEach((layerName) => {
    res.push(getLayerData(layersExchanger[layerName]))
  })
  return res
}

export default { getData }
