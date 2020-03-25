
const WickrIOAPI = require('wickrio_addon');
const updateLastID = require('../helpers/message-id-helper');
const BroadcastService = require('../broadcast-service');
const logger = require('../logger');
const state = require('../state');
const fileType = require('../file-type');

const broadcastService = new BroadcastService();
const dir = `${process.cwd()}/files/`;

class SendFile {
  shouldExecute() {}

  execute(fileName, fileToSend, fileType) {
    // TODO move filePathcreation?
    const messageToSend = broadcastService.messageToSend;
    const filePath = dir + fileName;
    const messageID = updateLastID();
    logger.debug('Here is the filePath', filePath);
    // var send = WickrIOAPI.cmdSendNetworkAttachment(user.filename, displayName, "", "", messageID, sentby);
    const uMessage = WickrIOAPI.cmdSendAttachmentUserHashFile(filePath, fileToSend, displayName, '', '', messageID, '');
    logger.debug('Broadcast uMessage', uMessage);
  }
}

module.exports = SendFile;
