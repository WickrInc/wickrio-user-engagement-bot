const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const logger = require('../logger');
const APIService = require('./api-service');

class ReportService {
  getMessageEntries(userEmail) {
    this.messageEntries = [];
    const tableDataRaw = APIService.getMessageIDTable();
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

  getMessageEntry(messageID) {
    return APIService.getMessageIDEntry(messageID);
  }

  getReport(messageID, vGroupID) {
    let inc = 0;
    const csvArray = [];
    while (true) {
      const statusData = APIService.getMessageStatus(messageID, 'full', `${inc}`, '1000');
      const messageStatus = JSON.parse(statusData);
      // for (const entry of messageStatus) {
      for (let i = 0; i < messageStatus.length; i += 1) {
        const entry = messageStatus[i];
        const reportEntry = ReportService.getReportEntry(entry);
        csvArray.push(
          {
            user: entry.user,
            status: reportEntry.statusString,
            statusMessage: reportEntry.statusMessageString,
          },
        );
      }
      if (messageStatus.length < 1000) {
        break;
      }
      inc += inc;
    }
    const now = new Date();
    const dateString = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}_${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}`;
    this.path = `${process.cwd()}/attachments/report-${dateString}.csv`;
    ReportService.writeCSVReport(this.path, csvArray);
    APIService.sendRoomAttachment(vGroupID, this.path, this.path);
    // TODO make a reply like here is the attachment
    // TODO can replies just be empty?
    return this.path;
  }

  static getReportEntry(entry) {
    let statusMessageString = '';
    let statusString = '';
    switch (entry.status) {
      case 0:
        statusString = 'pending';
        break;
      case 1:
        statusString = 'sent';
        break;
      case 2:
        statusString = 'failed';
        statusMessageString = entry.status_message;
        break;
      case 3:
        statusString = 'acked';
        if (entry.status_message !== undefined) {
          const obj = JSON.parse(entry.status_message);
          if (obj.location !== undefined) {
            const { latitude } = obj.location;
            const { longitude } = obj.location;
            statusMessageString = `http://www.google.com/maps/place/${latitude},${longitude}`;
          } else {
            statusMessageString = entry.status_message;
          }
        }
        break;
      case 4:
        statusString = 'ignored';
        statusMessageString = entry.status_message;
        break;
      case 5:
        statusString = 'aborted';
        statusMessageString = entry.status_message;
        break;
      case 6:
        statusString = 'received';
        statusMessageString = entry.status_message;
        break;
      default:
        // TODO figure out what this should be
        statusString = 'N/A';
        break;
    }
    return {
      statusMessageString,
      statusString,
    };
  }

  static writeCSVReport(path, csvArray) {
    const csvWriter = createCsvWriter({
      path,
      header: [
        { id: 'user', title: 'USER' },
        { id: 'status', title: 'STATUS' },
        { id: 'statusMessage', title: 'MESSAGE' },
      ],
    });
    csvWriter.writeRecords(csvArray)
      .then(() => {
        logger.debug('...Done');
      });
  }
}

module.exports = ReportService;
