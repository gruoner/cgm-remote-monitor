/* eslint-disable */
'use strict';

const _ = require("lodash");

function init(ctx) {
  var translate = ctx.language.translate;
  var levels = ctx.levels;

  var gps = {
    name: 'gps',
    label: 'GPS',
    pluginType: 'pill-status',
    pillFlip: true
  };

  gps.analyzeData = function analyzeData (sbx) {
    var recentData = _.filter(sbx.data.devicestatus, function eachStatus (status) {
      return ('gps' in status) && sbx.entryMills(status) <= sbx.time;
    });
    var result = {
      timestamp: undefined,
      position: undefined,
      accuracy: undefined,
      url: undefined,
      status: undefined
    };
    var recentLowests = _.sortBy(recentData, 'mills').reverse();
    var gps = _.first(recentLowests).gps;
    var pos = gps.split(' ')[1];
    result.accuracy = gps.split(' ')[2] + ' ' + gps.split(' ')[3];
    var lat = parseFloat(pos.split(',')[0]).toFixed(6);
    var long = parseFloat(pos.split(',')[1]).toFixed(6);

    result.position = lat + ',' + long + ' ';
    result.url = _.first(recentLowests).url;
    var d = new Date(_.first(recentLowests).mills);
    result.timestamp = d.toLocaleTimeString('de-DE');
    result.status =  pos + " " + result.accuracy;

    return result;
  };
  
  gps.updateVisualisation = function updateVisualisation(sbx) {
    var prop = sbx.properties.dbsize;
    var gpsDisplay = gps.analyzeData(sbx);
    var infos = [{
      label: 'Position (' + gpsDisplay.timestamp + '):'
      , value: gpsDisplay.status
    }];
    sbx.pluginBase.updatePillText(gps, {
      directHTML: true,
      label: '<em>GPS</em>\&amp;<a href=\"' + gpsDisplay.url + '\" target=\"_blank\" rel=\"noopener noreferrer\">' + gpsDisplay.position + ' ' + gpsDisplay.accuracy + '</a>',
      info: infos,
      pillClass: prop && prop.status
    });
  };

  return gps;
}

module.exports = init;