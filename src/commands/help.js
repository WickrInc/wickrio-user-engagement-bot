'use strict'

var state = require('../state');

//const WickrIOAPI = require('wickrio_addon');

const help = function() {
  var reply = "*Messages Commands*\n" +
              "/messages get a text file of all the messages from all the rooms with recorder bot in them.\n\n" +
              "*Admin Commands*\n" +
              "/admin list : Get list of admin users \n" +
              "/admin add <users> : Add one or more admin users \n" +
              "/admin remove <users> : Remove one or more admin users \n\n" +
              "*Other Commands*\n" +
              "/help : Show help information\n" +
              "/version : Get the version of the integration";
  //var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
  var obj = {
    reply: reply,
    state: state.NONE
  };
  return obj;
}

const version = function() {
  var reply = "*Versions*\nIntegration: " + pkgjson.version +
                          "\nWickrIO Addon: " + pkgjson.dependencies["wickrio_addon"] +
                          "\nWickrIO API: " + pkgjson.dependencies["wickrio-bot-api"] ;
  var obj = { 
    reply: reply,
    state: state.NONE
  }
  return obj;
}

module.exports = {
  help,
  version
}
