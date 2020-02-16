
const WickrIOAPI = require('wickrio_addon');
const state = require('../state');
const logger = require('../logger');

let currentMessageEntries;

function getMessageEntries(userEmail) {
  const messageIdEntries = [];
  const tableDataRaw = WickrIOAPI.cmdGetMessageIDTable('0', '1000');
  const tableData = JSON.parse(tableDataRaw);
  logger.debug('Here is table data:', tableData);
  logger.debug('And the useremail:', userEmail);
  for (let i = tableData.length - 1; i >= 0; i--) {
    const entry = tableData[i];
    logger.debug(`entry: ${entry}`);
    // logger.debug("entry keys: " + Object.keys(entry));
    if (entry.sender === userEmail) {
      messageIdEntries.push(entry);
    }
    if (messageIdEntries.length > 4) {
      break;
    }
  }
  return messageIdEntries;
}

const askStatus = function (userEmail) {
  // const messageIdEntries = getMessageEntries(userEmail);
  currentMessageEntries = getMessageEntries(userEmail);
  console.log("here are the messages:", currentMessageEntries);
  let reply = '';
  let obj;
  if (currentMessageEntries.length < 1) {
    reply = 'There are no previous messages to display';
    obj = {
      reply,
      state: state.NONE,
    };
  } else {
    const length = Math.min(currentMessageEntries.length, 5);
    let contentData;
    let index = 1;
    const messageList = [];
    let messageString = '';
    // for (let entry of messageIdEntries) {
    for (let i = 0; i < currentMessageEntries.length; i++) {
      contentData = WickrIOAPI.cmdGetMessageIDEntry(currentMessageEntries[i].message_id);
      const contentParsed = JSON.parse(contentData);
      messageList.push(contentParsed.message);
      messageString += `(${index++}) ${contentParsed.message}\n`;
    }
    reply = `Here are the past ${length} broadcast message(s):\n`
          + `${messageString}`
          + 'Which message would you like to see the status of?';
    obj = {
      reply,
      state: state.WHICH_MESSAGE,
    };
  }
  return obj;
};

function isInt(value) {
  return !isNaN(value) && (function (x) { return (x | 0) === x; }(parseFloat(value)));
}

const messageChosen = function (index) {
  let reply;
  let obj;
  const length = Math.min(currentMessageEntries.length, 5);
  if (!isInt(index) || index < 1 || index > length) {
    reply = `Index: ${index} is out of range. Please enter a number between 1 and ${length}`;
    obj = {
      reply,
      state: state.CHOOSE_FILE,
    };
  } else {
    const messageID = `${currentMessageEntries[parseInt(index, 10) - 1].message_id}`;
    reply = getStatus(messageID, 'summary', false);
    obj = {
      reply,
      state: state.NONE,
    };
  }
  return obj;
};

const getStatus = function (messageID, type, asyncStatus) {
  // TODO Here we need which Message??
  let statusData;
  try {
    statusData = WickrIOAPI.cmdGetMessageStatus(messageID, type, '0', '1000');
  } catch (err) {
    if (asyncStatus) {
      const returnObj = {
        statusString: 'No data found for that message',
        complete: true,
      };
      return returnObj;
    }
    return 'No data found for that message';
  }
  const messageStatus = JSON.parse(statusData);
  const statusString = '*Message Status:*\n'
                   + `Total Users: ${messageStatus.num2send}\n`
                   + `Messages Sent: ${messageStatus.sent}\n`
                   + `Message pending to Users: ${messageStatus.pending}\n`
                   + `Message failed to send: ${messageStatus.failed}`;
  // console.log("here is the message status" + statusString);
  if (asyncStatus) {
    const complete = messageStatus.pending === 0;
    const returnObj = {
      statusString,
      complete,
    };
    return returnObj;
  }
  return statusString;
};

module.exports = {
  getStatus,
  askStatus,
  messageChosen,
};
