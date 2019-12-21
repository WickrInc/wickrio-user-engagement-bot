
const fs = require('fs');
const WickrIOAPI = require('wickrio_addon');
const state = require('../state');
const FileHandler = require('../helpers/file-handler');
const logger = require('../logger');
const BroadcastService = require('../broadcast-service');
const InitializeBroadcast = require('./initialize-broadcast');
const updateLastID = require('../helpers/message-id-helper');

const fileHandler = new FileHandler();
const broadcastService = new BroadcastService();
const initializeBroadcast = new InitializeBroadcast();

// var dir = './files';
if (!fs.existsSync(`${process.cwd()}/files`)) {
  fs.mkdirSync(`${process.cwd()}/files`);
}
const dir = `${process.cwd()}/files/`;

let messageToSend;
// let fileArr;

function startBroadcast (message) {
  messageToSend = message;
  return initializeBroadcast.execute();
  /*
  let reply = 'To which list would you like to send your message:\n';
  fileArr = broadcastService.getFiles(fileHandler);
  logger.debug('Here is the fileArr: ', fileArr, '\nAnd the messageToSend:', messageToSend);
  length = Math.min(fileArr.length, 5);
  for (let index = 0; index < length; index++) {
    reply += `(${index + 1}) ${fileArr[index]}\n`;
  }
  const obj = {
    reply,
    state: state.CHOOSE_FILE,
  };
  return obj;
  */
};

const fileChosen = function (index) {
  let reply = null;
  let obj;
  let fileArr = broadcastService.getFileArr();
  let length = Math.min(fileArr.length, 5);
  if (!isInt(index) || index < 1 || index > length) {
    reply = `Index: ${index} is out of range. Please enter a number between 1 and ${length}`;
    obj = {
      reply,
      state: state.CHOOSE_FILE,
    };
  } else {
    // logger.debug('here is the other fileArr', fileArr, '\n');
    // TODO matt distracted fix later
    reply = 'message sent to a file';
    const fileName = fileArr[parseInt(index, 10) - 1];
    broadcast(fileName);
    obj = {
      reply,
      state: state.NONE,
    };
  }
  return obj;
};

const broadcast = function (fileName) {
  // TODO move filePathcreation?
  const filePath = dir + fileName;
  const messageID = updateLastID();
  logger.debug('Heree is the filePath', filePath);
  const uMessage = WickrIOAPI.cmdSendMessageUserHashFile(filePath, messageToSend, '', '', messageID);
  logger.debug('Broadcast uMessage', uMessage);
};

module.exports = {
  startBroadcast,
  fileChosen,
};

// TODO check this function
function isInt(value) {
  return !isNaN(value) && (function (x) { return (x | 0) === x; }(parseFloat(value)));
}
