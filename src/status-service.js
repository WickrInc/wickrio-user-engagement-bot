const WickrIOAPI = require('wickrio_addon');
const cron = require('node-cron');

const logger = require('./logger');
const APIService = require('./api-service');

class StatusService {
  static getMessageEntries(userEmail) {
    this.messageEntries = [];
    const tableDataRaw = WickrIOAPI.cmdGetMessageIDTable('0', '1000');
    const tableData = JSON.parse(tableDataRaw);
    for (let i = tableData.length - 1; i >= 0; i -= 1) {
      const entry = tableData[i];
      if (entry.sender === userEmail) {
        this.messageEntries.push(entry);
      }
      if (this.messageEntries.length > 4) {
        break;
      }
    }
    return this.messageEntries;
  }

  // Type is status or report
  static getStatus(messageID, type, asyncStatus) {
  // TODO Here we need which Message??
    let statusData;
    try {
      statusData = APIService.getMessageStatus(messageID, type, '0', '1000');
    } catch (err) {
      if (asyncStatus) {
        return {
          statusString: 'No data found for that message',
          complete: true,
        };
      }
      return 'No data found for that message';
    }
    const messageStatus = JSON.parse(statusData);
    let statusString = '*Message Status:*\n'
                   + `Total Users: ${messageStatus.num2send}\n`
                   + `Messages Sent: ${messageStatus.sent}\n`
                   + `Message pending to Users: ${messageStatus.pending}\n`
                   + `Message failed to send: ${messageStatus.failed}`;
    if (messageStatus.ignored !== undefined) {
      statusString = `${statusString}Messages Ignored: ${messageStatus.ignored}`;
    }
    if (asyncStatus) {
      const complete = messageStatus.pending === 0;
      return {
        statusString,
        complete,
      };
    }
    return statusString;
  }

  static getMessageEntry(messageID) {
    return APIService.getMessageIDEntry(messageID);
  }

  static asyncStatus(messageID, vGroupID) {
    logger.debug('Enter asyncStatus ');
    const timeString = '*/30 * * * * *';
    const cronJob = cron.schedule(timeString, () => {
      logger.debug('Running cronjob');
      const statusObj = StatusService.getStatus(messageID, 'summary', true);
      APIService.sendRoomMessage(vGroupID, statusObj.statusString);
      if (statusObj.complete) {
        return cronJob.stop();
      }
      return false;
    });
    cronJob.start();
  }
}

module.exports = StatusService;
