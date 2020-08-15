// TODO delete this file!
import WickrIOAPI from 'wickrio_addon'
import updateLastID from '../helpers/message-id-helper'
import BroadcastService from '../broadcast-service'
import logger from '../logger'

const broadcastService = new BroadcastService()
const dir = `${process.cwd()}/files/`

class SendBroadcast {
  broadcast(fileName) {
    // TODO move filePathcreation?
    const { messageToSend } = broadcastService
    const filePath = dir + fileName
    const messageID = updateLastID()
    logger.debug('Here is the filePath', filePath)
    // TODO fix this so that it sends to either hash or user file
    const uMessage = WickrIOAPI.cmdSendMessageUserHashFile(
      filePath,
      messageToSend,
      '',
      '',
      messageID
    )
    logger.debug('Broadcast uMessage', uMessage)
  }
}

module.exports = SendBroadcast
