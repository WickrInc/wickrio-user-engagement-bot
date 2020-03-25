const WickrIOAPI = require('wickrio_addon');
const logger = require('./logger');
const FileHandler = require('./helpers/file-handler');
const WriteMessageIDDB = require('./helpers/write-message-id-db');
// TODO proper form??
const updateLastID = require('./helpers/message-id-helper');

const fileHandler = new FileHandler();
const writeMessageIdDb = new WriteMessageIDDB();

const dir = `${process.cwd()}/files/`;

// let userEmail;
let fileArr;

class BroadcastService {
  constructor() {
    this.fileToSend = '';
    this.messageToSend = '';
    this.userEmail = '';
    this.displayName = '';
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

  setFileToSend(file) {
    this.fileToSend = file;
  }

  setMessageToSend(message) {
    this.messageToSend = message;
  }

  setDisplayName(displayName) {
    this.displayName = displayName;
  }

  setUserEmail(email) {
    this.userEmail = email;
  }

  // TODO ask Matt if I should split this
  broadcastToFile(fileName) {
    logger.debug('Broadcasting to a file');
    const currentDate = new Date();
    // "YYYY-MM-DDTHH:MM:SS.sssZ"
    const jsonDateTime = currentDate.toJSON();
    // TODO move filePathcreation?
    const filePath = dir + fileName;
    const messageID = updateLastID();
    // TODO fix this logging
    logger.debug(`Here is the filePath:${filePath}`);
    logger.debug(filePath);
    let uMessage;
    logger.debug(`fileToSend: ${this.fileToSend}`);
    logger.debug(`DisplayName: ${this.displayName}`);
    logger.debug(`messageToSend: ${this.messageToSend}`);
    if (this.fileToSend !== '') {
      logger.debug(`fileToSend: ${this.fileToSend}`);
      if (fileName.endsWith('hash')) {
        uMessage = WickrIOAPI.cmdSendAttachmentUserHashFile(filePath, this.fileToSend, this.displayName, '', '', messageID);
      } else if (fileName.endsWith('user')) {
        uMessage = WickrIOAPI.cmdSendAttachmentUserNameFile(filePath, this.fileToSend, this.displayName, '', '', messageID);
      }
      // TODO make this the display name
      logger.debug(`DisplayName is ${this.displayName}`);
      writeMessageIdDb.writeMessageIDDB(messageID, this.userEmail, filePath, jsonDateTime, this.displayName);
    } else if (this.messageToSend.length !== 0) {
      if (fileName.endsWith('hash')) {
        uMessage = WickrIOAPI.cmdSendMessageUserHashFile(filePath, this.messageToSend, '', '', messageID);
      } else if (fileName.endsWith('user')) {
        uMessage = WickrIOAPI.cmdSendMessageUserNameFile(filePath, this.messageToSend, '', '', messageID);
      }
      writeMessageIdDb.writeMessageIDDB(messageID, this.userEmail, filePath, jsonDateTime, this.messageToSend);
    } else {
      // TODO fix this is it necessary?
      logger.debug(`messageToSend: ${this.messageToSend}`);
      logger.debug(`messageToSendLength: ${this.messageToSend.length}`);
      logger.error('Unexpected error occured');
    }
    this.fileToSend = '';
    this.displayName = '';
    this.messageToSend = '';
    this.userEmail = '';
    logger.debug(`Broadcast uMessage${uMessage}`);
  }

  // TODO check if this works as expected
  isInt(value) {
    return !isNaN(value) && (function (x) { return (x | 0) === x; }(parseFloat(value)));
  }
}

module.exports = BroadcastService;
