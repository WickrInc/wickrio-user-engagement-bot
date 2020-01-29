
const WickrIOAPI = require('wickrio_addon');
const logger = require('./logger');
const FileHandler = require('./helpers/file-handler');
const WriteMessageIDDB = require('./helpers/write-message-id-db');
// TODO proper form??
const updateLastID = require('./helpers/message-id-helper');

const fileHandler = new FileHandler();
const writeMessageIdDb = new WriteMessageIDDB();

const dir = `${process.cwd()}/files/`;

let currentState;
// TODO how does 'this' work in node??
let messageToSend;
let fileArr;

class BroadcastService {
  constructor() {
  }

  // TODO what happens if someone is adding a file at the same time as someone is sending a message???
  getFiles() {
    try {
      fileArr = fileHandler.listFiles(dir);
      return fileArr;
    } catch (err) {
      // TODO fix this!!! gracefully >:)
      logger.error(err);
      return null;
    }
  }

  getFileArr() {
    return fileArr;
  }

  chooseFile(index) {
    if (!isInt(index) || index < 1 || index > fileArr.length) {
      return null;
    }
    return fileArr[parseInt(index, 10) - 1];
  }

  setMessageToSend(message) {
    messageToSend = message;
  }

  broadcastToFile(fileName) {
    logger.debug('Broadcasting to a file');
    var currentDate = new Date();
    //"YYYY-MM-DDTHH:MM:SS.sssZ"
    var jsonDateTime = currentDate.toJSON();
    // TODO move filePathcreation?
    const filePath = dir + fileName;
    const messageID = updateLastID();
    logger.debug('Heree is the filePath', filePath);
    const uMessage = WickrIOAPI.cmdSendMessageUserHashFile(filePath, messageToSend, '', '', messageID);
    logger.debug('Broadcast uMessage', uMessage);
    writeMessageIdDb.writeMessageIDDB(messageID, 'torenwickr', filePath, jsonDateTime, messageToSend);
  }

  uploadFile(file) {
  }

  // TODO check if this works as expected
  isInt(value) {
    return !isNaN(value) && (function (x) { return (x | 0) === x; }(parseFloat(value)));
  }
}

module.exports = BroadcastService;
