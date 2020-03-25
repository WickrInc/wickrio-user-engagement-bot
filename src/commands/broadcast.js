const fs = require('fs');
const WickrIOAPI = require('wickrio_addon');
const state = require('../state');
const FileHandler = require('../helpers/file-handler');
const logger = require('../logger');
const BroadcastService = require('../broadcast-service');
const InitializeBroadcast = require('./initialize-broadcast');
const ChooseFile = require('./choose-file');
const updateLastID = require('../helpers/message-id-helper');

const fileHandler = new FileHandler();
const broadcastService = new BroadcastService();
const initializeBroadcast = new InitializeBroadcast();
const chooseFile = new ChooseFile();

if (!fs.existsSync(`${process.cwd()}/files`)) {
  fs.mkdirSync(`${process.cwd()}/files`);
}
const dir = `${process.cwd()}/files/`;

let messageToSend;

function startBroadcast(message, userEmail) {
  // TODO look at this logic perhaps put this in the initBroadcast
  if (!message) {
    const reply = 'Must have a message to broadcast, Usage: /broadcast <message>';
    const obj = {
      reply,
      state: state.NONE,
    };
    return obj;
  }
  broadcastService.setMessageToSend(message);
  broadcastService.setUserEmail(userEmail);
  return initializeBroadcast.execute();
}

const fileChosen = function (index) {
  return chooseFile.execute(index);
};

const broadcast = function (fileName) {
  // TODO move filePathcreation?
  const filePath = dir + fileName;
  const messageID = updateLastID();
  logger.debug('Heree is the filePath', filePath);
  const uMessage = WickrIOAPI.cmdSendMessageUserHashFile(filePath, messageToSend, '', '', messageID);
  logger.debug('Broadcast uMessage', uMessage);
};

// TODO fix all this
module.exports = {
  startBroadcast,
  fileChosen,
  broadcast,
};

// TODO check this function
