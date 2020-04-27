const WickrIOAPI = require('wickrio_addon');
const logger = require('./logger');

// TODO make fs a variable that is passed into the constructor
class APIService {
  static getSecurityGroups() {
    const groupData = WickrIOAPI.cmdGetSecurityGroups();
    const temp = JSON.parse(groupData);
    logger.debug(`temp${temp}`);
    // return JSON.parse(groupData);
    return temp;
  }

  static sendSecurityGroupVoiceMemo(securityGroups, voiceMemo, duration, messageID, sentby) {
    // TODO add time sent to VoiceMemo String?
    return WickrIOAPI.cmdSendSecurityGroupVoiceMemo(securityGroups, voiceMemo, 'VoiceMemo', duration, '', '', messageID, sentby);
  }

  static sendSecurityGroupAttachment(securityGroups, filename, displayName, messageID, sentby) {
    return WickrIOAPI.cmdSendSecurityGroupAttachment(securityGroups, filename, displayName, '', '', messageID, sentby);
  }

  static sendSecurityGroupMessage(securityGroups, message, messageID) {
    return WickrIOAPI.cmdSendSecurityGroupMessage(message, securityGroups, '', '', messageID);
  }

  static sendNetworkVoiceMemo(voiceMemo, duration, messageID, sentby) {
    return WickrIOAPI.cmdSendNetworkVoiceMemo(voiceMemo, 'VoiceMemo', duration, '', '', messageID, sentby);
  }

  static sendNetworkAttachment(filename, displayName, messageID, sentby) {
    return WickrIOAPI.cmdSendNetworkAttachment(filename, displayName, '', '', messageID, sentby);
  }

  static sendNetworkMessage(message, messageID) {
    return WickrIOAPI.cmdSendNetworkMessage(message, '', '', messageID);
  }

  static writeMessageIDDB(messageId, sender, target, dateSent, messageContent) {
    WickrIOAPI.cmdAddMessageID(messageId, sender, target, dateSent, messageContent);
  }
}

module.exports = APIService;
