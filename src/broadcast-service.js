const fs = require('fs');
const logger = require('./logger');
const FileHandler = require('./helpers/file-handler');
const APIService = require('./api-service');
const StatusService = require('./status-service');
// TODO proper form??
const updateLastID = require('./helpers/message-id-helper');

const fileHandler = new FileHandler();

// TODO make fs a variable that is passed into the constructor
if (!fs.existsSync(`${process.cwd()}/files`)) {
  fs.mkdirSync(`${process.cwd()}/files`);
}

const dir = `${process.cwd()}/files/`;

class BroadcastService {
  constructor() {
    this.file = '';
    this.message = '';
    this.userEmail = '';
    this.display = '';
    this.ackFlag = false;
    this.securityGroups = [];
    this.duration = 0;
    this.voiceMemo = '';
    this.repeatFlag = false;
  }

  setRepeatFlag(repeatFlag) {
    this.repeatFlag = repeatFlag;
  }

  setFile(file) {
    this.file = file;
  }

  setVoiceMemo(voiceMemo) {
    this.voiceMemo = voiceMemo;
  }

  setDuration(duration) {
    this.duration = duration;
  }

  setMessage(message) {
    this.message = message;
  }

  setDisplay(display) {
    this.display = display;
  }

  setUserEmail(email) {
    this.userEmail = email;
  }

  setSecurityGroups(securityGroups) {
    this.securityGroups = securityGroups;
  }

  setAckFlag(ackFlag) {
    this.ackFlag = ackFlag;
  }

  broadcastMessage(vGroupID) {
    let sentBy = `\n\nBroadcast message sent by: ${this.userEmail}`;
    if (this.ackFlag) {
      this.message = `${this.message}\nPlease acknowledge this message by replying with /ack`;
      sentBy = `${sentBy}\nPlease acknowledge this message by replying with /ack`;
    }
    const target = (this.securityGroups.length < 1 || this.securityGroups === undefined) ? 'NETWORK' : this.securityGroups.join();
    logger.debug(`target${target}`);
    const currentDate = new Date();
    // "YYYY-MM-DDTHH:MM:SS.sssZ"
    const jsonDateTime = currentDate.toJSON();
    // messageID must be a string
    // TODO is is necessary to do this?
    const messageID = `${updateLastID()}`;
    let uMessage;
    let reply;
    if (target === 'NETWORK') {
      if (this.voiceMemo !== '') {
        uMessage = APIService.sendNetworkVoiceMemo(this.voiceMemo, this.duration, messageID, sentBy);
        reply = 'Voice Memo broadcast in process of being sent';
      } else if (this.file !== '') {
        uMessage = APIService.sendNetworkAttachment(this.file, this.display, messageID, sentBy);
        reply = 'File broadcast in process of being sent';
      } else {
        uMessage = APIService.sendNetworkMessage(this.message, messageID);
        reply = 'Broadcast message in process of being sent';
      }
    } else if (this.voiceMemo !== '') {
      uMessage = APIService.sendSecurityGroupVoiceMemo(this.securityGroups, this.voiceMemo, this.duration, messageID, sentBy);
      reply = 'Voice Memo broadcast in process of being sent to security group';
    } else if (this.file !== '') {
      uMessage = APIService.sendSecurityGroupAttachment(this.securityGroups, this.file, this.display, messageID, sentBy);
      reply = 'File broadcast in process of being sent to security group';
    } else {
      uMessage = APIService.sendSecurityGroupMessage(this.securityGroups, this.message, messageID);
      reply = 'Broadcast message in process of being sent to security group';
    }
    if (this.file !== '') {
      APIService.writeMessageIDDB(messageID, this.userEmail, target, jsonDateTime, this.display);
    } else if (this.voiceMemo !== '') {
      APIService.writeMessageIDDB(messageID, this.userEmail, target, jsonDateTime, `VoiceMemo-${jsonDateTime}`);
    } else {
      APIService.writeMessageIDDB(messageID, this.userEmail, target, jsonDateTime, this.message);
    }
    StatusService.asyncStatus(messageID, vGroupID);
    logger.debug(`Broadcast uMessage${uMessage}`);
    return reply;
  }

  // TODO check if this works as expected
  static isInt(value) {
    // return !isNaN(value) && (function (x) { return (x | 0) === x; }(parseFloat(value)));
    return !(Number.isNaN(value));
  }
}

module.exports = BroadcastService;
