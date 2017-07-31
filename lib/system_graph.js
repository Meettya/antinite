"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Build system graph for all layers
 */

var getData = void 0,
    getLayerData = void 0,
    processServicesData = void 0,
    getServiceData = void 0;

getServiceData = function getServiceData(serviceObj) {
  return {
    name: serviceObj.getName(),
    isReady: serviceObj.isReady(),
    isLegacy: serviceObj.isLegacy(),
    acl: serviceObj.getAcl(),
    export: serviceObj.getExportDict(),
    require: serviceObj.getRequireDict()
  };
};

processServicesData = function processServicesData(servicesDict) {
  var res = [];

  Object.keys(servicesDict).forEach(function (serviceName) {
    res.push(getServiceData(servicesDict[serviceName]));
  });
  return res;
};

getLayerData = function getLayerData(layerObj) {
  return {
    name: layerObj.getName(),
    isReady: layerObj.isReady(),
    isLegacy: layerObj.isLegacy(),
    services: processServicesData(layerObj.getServices())
  };
};

getData = function getData(layersExchanger) {
  var res = [];

  Object.keys(layersExchanger).forEach(function (layerName) {
    res.push(getLayerData(layersExchanger[layerName]));
  });
  return res;
};

exports.default = { getData: getData };