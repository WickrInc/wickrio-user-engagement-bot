'use strict'

//var factory = require('./factory.js');
//var fileHandler = require('./file-handler.js');
const logger = require('./logger');

async function main() {
  // console.log("HELLO");
  logger.debug("hello");
  logger.error("error here");
  console.log("worked");
  //var obj = await factory.factory('NONE', '/help');//, 'Hello world');
  //console.log("ADTER", obj.reply);

//  console.log(fileHandler.listFiles('./files'));
 // fileHandler.checkFile('./attachments', 'messages.txt');
  //fileHandler.checkFile('./attachments', 'toren');
}

main();
