import WickrIOAPI from 'wickrio_addon'
import logger from './logger'

class WriteMessageIDDB {
  writeMessageIDDB(messageId, sender, target, dateSent, messageContent) {
    logger.debug('inside writeToMessageIdDB')
    // TODO should this return something?
    WickrIOAPI.cmdAddMessageID(
      messageId,
      sender,
      target,
      dateSent,
      messageContent
    )
  }
}

module.exports = WriteMessageIDDB
