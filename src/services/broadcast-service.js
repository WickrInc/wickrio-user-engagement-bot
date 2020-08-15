import WickrIOAPI from 'wickrio_addon'
import fs from 'fs'
import logger from '../helpers/logger'
import FileHandler from '../helpers/file-handler'
import WriteMessageIDDB from '../helpers/write-message-id-db'
// TODO proper form??
import updateLastID from '../helpers/message-id-helper'

const fileHandler = new FileHandler()
const writeMessageIdDb = new WriteMessageIDDB()

// TODO make fs a variable that is passed into the constructor
if (!fs.existsSync(`${process.cwd()}/files`)) {
  fs.mkdirSync(`${process.cwd()}/files`)
}

const dir = `${process.cwd()}/files/`

class BroadcastService {
  constructor() {
    this.fileToSend = ''
    this.messageToSend = ''
    this.userEmail = ''
    this.displayName = ''
  }

  // TODO what happens if someone is adding a file at the same time as someone is sending a message?
  getFiles() {
    try {
      this.fileArr = fileHandler.listFiles(dir)
      return this.fileArr
    } catch (err) {
      // TODO fix this!!! gracefully >:)
      logger.error(err)
      return null
    }
  }

  getFileArr() {
    return this.fileArr
  }

  setFileToSend(file) {
    this.fileToSend = file
  }

  setMessageToSend(message) {
    this.messageToSend = message
  }

  setDisplayName(displayName) {
    this.displayName = displayName
  }

  setUserEmail(email) {
    this.userEmail = email
  }

  // TODO ask Matt if I should split this
  broadcastToFile(fileName) {
    logger.debug('Broadcasting to a file')
    if (this.fileToSend !== '') {
      this.broadcastFileToFile(fileName)
    } else if (this.messageToSend.length !== 0) {
      this.broadcastMessageToFile(fileName)
    } else {
      // TODO fix this is it necessary?
      logger.debug(`messageToSend: ${this.messageToSend}`)
      logger.debug(`messageToSendLength: ${this.messageToSend.length}`)
      logger.error('Unexpected error occured')
    }
    this.fileToSend = ''
    this.displayName = ''
    this.messageToSend = ''
    this.userEmail = ''
  }

  broadcastMessageToFile(fileName) {
    // TODO move filePathcreation?
    const currentDate = new Date()
    // "YYYY-MM-DDTHH:MM:SS.sssZ"
    const jsonDateTime = currentDate.toJSON()
    const filePath = dir + fileName
    let uMessage
    const messageID = updateLastID()
    if (fileName.endsWith('hash')) {
      uMessage = WickrIOAPI.cmdSendMessageUserHashFile(
        filePath,
        this.messageToSend,
        '',
        '',
        messageID
      )
    } else if (fileName.endsWith('user')) {
      uMessage = WickrIOAPI.cmdSendMessageUserNameFile(
        filePath,
        this.messageToSend,
        '',
        '',
        messageID
      )
    }
    writeMessageIdDb.writeMessageIDDB(
      messageID,
      this.userEmail,
      filePath,
      jsonDateTime,
      this.messageToSend
    )
    logger.debug(`Broadcast uMessage${uMessage}`)
  }

  broadcastFileToFile(fileName) {
    // TODO move filePathcreation?
    const currentDate = new Date()
    // "YYYY-MM-DDTHH:MM:SS.sssZ"
    const jsonDateTime = currentDate.toJSON()
    const filePath = dir + fileName
    let uMessage
    const messageID = updateLastID()
    if (fileName.endsWith('hash')) {
      uMessage = WickrIOAPI.cmdSendAttachmentUserHashFile(
        filePath,
        this.fileToSend,
        this.displayName,
        '',
        '',
        messageID
      )
    } else if (fileName.endsWith('user')) {
      uMessage = WickrIOAPI.cmdSendAttachmentUserNameFile(
        filePath,
        this.fileToSend,
        this.displayName,
        '',
        '',
        messageID
      )
    }
    writeMessageIdDb.writeMessageIDDB(
      messageID,
      this.userEmail,
      filePath,
      jsonDateTime,
      this.displayName
    )
    logger.debug(`Broadcast uMessage${uMessage}`)
  }

  // TODO check if this works as expected
  static isInt(value) {
    // return !isNaN(value) && (function (x) { return (x | 0) === x; }(parseFloat(value)));
    return !Number.isNaN(value)
  }
}

module.exports = BroadcastService
