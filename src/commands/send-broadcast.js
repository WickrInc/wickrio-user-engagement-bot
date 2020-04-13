// TODO delete this file!
const WickrIOAPI = require('wickrio_addon');
const updateLastID = require('../helpers/message-id-helper');
const BroadcastService = require('../broadcast-service');
const logger = require('../logger');

const broadcastService = new BroadcastService();
const dir = `${process.cwd()}/files/`;

class SendBroadcast {
  broadcast(fileName) {
    // TODO move filePathcreation?
    const { messageToSend } = broadcastService;
    const filePath = dir + fileName;
    const messageID = updateLastID();
    logger.debug('Here is the filePath', filePath);
    // TODO fix this so that it sends to either hash or user file
    const uMessage = WickrIOAPI.cmdSendMessageUserHashFile(
      filePath,
      messageToSend,
      '',
      '',
      messageID,
    );
    logger.debug('Broadcast uMessage', uMessage);
  }
}

module.exports = SendBroadcast;
