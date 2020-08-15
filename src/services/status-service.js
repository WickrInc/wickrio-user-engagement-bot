import WickrIOAPI from 'wickrio_addon'
import logger from './logger'

class StatusService {
  constructor() {
    this.userEmail = ''
  }

  getUserEmail() {
    return this.userEmail
  }

  setUserEmail(email) {
    this.userEmail = email
  }

  getMessageEntries() {
    return this.messageEntries
  }

  initMessageEntries(userEmail) {
    this.messageEntries = []
    const tableDataRaw = WickrIOAPI.cmdGetMessageIDTable('0', '1000')
    const tableData = JSON.parse(tableDataRaw)
    logger.debug('Here is table data:', tableData)
    logger.debug('And the useremail:', userEmail)
    for (let i = tableData.length - 1; i >= 0; i -= 1) {
      const entry = tableData[i]
      logger.debug(`entry: ${entry}`)
      // logger.debug("entry keys: " + Object.keys(entry));
      if (entry.sender === userEmail) {
        this.messageEntries.push(entry)
      }
      if (this.messageEntries.length > 4) {
        break
      }
    }
    return this.messageEntries
  }

  // Type is status or report
  // TODO Should this be static?
  static getStatus(messageID, type, asyncStatus) {
    // TODO Here we need which Message??
    let statusData
    try {
      statusData = WickrIOAPI.cmdGetMessageStatus(messageID, type, '0', '1000')
    } catch (err) {
      if (asyncStatus) {
        const returnObj = {
          statusString: 'No data found for that message',
          complete: true,
        }
        return returnObj
      }
      return 'No data found for that message'
    }
    const messageStatus = JSON.parse(statusData)
    const statusString =
      '*Message Status:*\n' +
      `Total Users: ${messageStatus.num2send}\n` +
      `Messages Sent: ${messageStatus.sent}\n` +
      `Message pending to Users: ${messageStatus.pending}\n` +
      `Message failed to send: ${messageStatus.failed}`
    // console.log("here is the message status" + statusString);
    if (asyncStatus) {
      const complete = messageStatus.pending === 0
      const returnObj = {
        statusString,
        complete,
      }
      return returnObj
    }
    return statusString
  }
}

module.exports = StatusService
