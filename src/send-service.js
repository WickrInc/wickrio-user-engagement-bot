const WickrIOAPI = require('wickrio_addon');
const fs = require('fs');
const logger = require('./logger');
const FileHandler = require('./helpers/file-handler');
const WriteMessageIDDB = require('./helpers/write-message-id-db');
// TODO proper form??
const updateLastID = require('./helpers/message-id-helper');

const fileHandler = new FileHandler();
const writeMessageIdDb = new WriteMessageIDDB();

// TODO make fs a variable that is passed into the constructor
if (!fs.existsSync(`${process.cwd()}/files`)) {
  fs.mkdirSync(`${process.cwd()}/files`);
}

const dir = `${process.cwd()}/files/`;

class SendService {
  constructor() {
    this.file = '';
    this.message = '';
    this.userEmail = '';
    this.displayName = '';
  }

  // TODO what happens if someone is adding a file at the same time as someone is sending a message?
  getFiles() {
    try {
      this.fileArr = fileHandler.listFiles(dir);
      return this.fileArr;
    } catch (err) {
      // TODO fix this!!! gracefully >:)
      logger.error(err);
      return null;
    }
  }

  getFileArr() {
    return this.fileArr;
  }

  setFile(file) {
    this.file = file;
  }

  setMessage(message) {
    this.message = message;
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
    if (this.file !== '') {
      this.broadcastFileToFile(fileName);
    } else if (this.message.length !== 0) {
      this.broadcastMessageToFile(fileName);
    } else {
      // TODO fix this is it necessary?
      logger.debug(`message: ${this.message}`);
      logger.debug(`messageLength: ${this.message.length}`);
      logger.error('Unexpected error occured');
    }
    this.file = '';
    this.displayName = '';
    this.message = '';
    this.userEmail = '';
  }

  broadcastMessageToFile(fileName) {
    // TODO move filePathcreation?
    const currentDate = new Date();
    // "YYYY-MM-DDTHH:MM:SS.sssZ"
    const jsonDateTime = currentDate.toJSON();
    const filePath = dir + fileName;
    let uMessage;
    const messageID = updateLastID();
    if (fileName.endsWith('hash')) {
      uMessage = WickrIOAPI.cmdSendMessageUserHashFile(filePath, this.message, '', '', messageID);
    } else if (fileName.endsWith('user')) {
      uMessage = WickrIOAPI.cmdSendMessageUserNameFile(filePath, this.message, '', '', messageID);
    }
    writeMessageIdDb.writeMessageIDDB(messageID, this.userEmail, filePath, jsonDateTime, this.message);
    logger.debug(`Broadcast uMessage${uMessage}`);
  }

  broadcastFileToFile(fileName) {
    // TODO move filePathcreation?
    const currentDate = new Date();
    // "YYYY-MM-DDTHH:MM:SS.sssZ"
    const jsonDateTime = currentDate.toJSON();
    const filePath = dir + fileName;
    let uMessage;
    const messageID = updateLastID();
    if (fileName.endsWith('hash')) {
      uMessage = WickrIOAPI.cmdSendAttachmentUserHashFile(filePath, this.file, this.displayName, '', '', messageID);
    } else if (fileName.endsWith('user')) {
      uMessage = WickrIOAPI.cmdSendAttachmentUserNameFile(filePath, this.file, this.displayName, '', '', messageID);
    }
    writeMessageIdDb.writeMessageIDDB(messageID, this.userEmail, filePath, jsonDateTime, this.displayName);
    logger.debug(`Broadcast uMessage${uMessage}`);
  }
}

module.exports = SendService;
