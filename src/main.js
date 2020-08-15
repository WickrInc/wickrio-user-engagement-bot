'use strict'

//var factory = require('./factory.js');
//var fileHandler = require('./file-handler.js');
import logger from './logger'
import WhitelistRepository from './helpers/whitelist'

const whitelist = new WhitelistRepository()

async function main() {
  // console.log("HELLO");
  logger.debug('hello')
  logger.error('error here')
  console.log('worked')
  let adding = whitelist.getWhitelist().push('torenindex')
  logger.debug('whitelist:', whitelist.getWhitelist())
  whitelist.updateWhitelist(adding)
  logger.debug('whitelist After:', whitelist.getWhitelist())
  //logger.debug('add', whitelist.g
  //var obj = await factory.factory('NONE', '/help');//, 'Hello world');
  //console.log("ADTER", obj.reply);

  //  console.log(fileHandler.listFiles('./files'));
  // fileHandler.checkFile('./attachments', 'messages.txt');
  //fileHandler.checkFile('./attachments', 'toren');
}

main()
