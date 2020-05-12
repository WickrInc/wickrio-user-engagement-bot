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

  static sendSecurityGroupVoiceMemo(securityGroups, voiceMemo, duration, messageID, sentBy) {
    // TODO add time sent to VoiceMemo String?
    return WickrIOAPI.cmdSendSecurityGroupVoiceMemo(securityGroups, voiceMemo, 'VoiceMemo', duration, '', '', messageID, sentBy);
  }

  static sendSecurityGroupAttachment(securityGroups, filename, displayName, messageID, sentBy) {
    return WickrIOAPI.cmdSendSecurityGroupAttachment(securityGroups, filename, displayName, '', '', messageID, sentBy);
  }

  static sendSecurityGroupMessage(securityGroups, message, messageID) {
    return WickrIOAPI.cmdSendSecurityGroupMessage(message, securityGroups, '', '', messageID);
  }

  static sendNetworkVoiceMemo(voiceMemo, duration, messageID, sentBy) {
    return WickrIOAPI.cmdSendNetworkVoiceMemo(voiceMemo, 'VoiceMemo', duration, '', '', messageID, sentBy);
  }

  static sendNetworkAttachment(filename, displayName, messageID, sentBy) {
    return WickrIOAPI.cmdSendNetworkAttachment(filename, displayName, '', '', messageID, sentBy);
  }

  static sendNetworkMessage(message, messageID) {
    return WickrIOAPI.cmdSendNetworkMessage(message, '', '', messageID);
  }

  static writeMessageIDDB(messageId, sender, target, dateSent, messageContent) {
    return WickrIOAPI.cmdAddMessageID(messageId, sender, target, dateSent, messageContent);
  }

  static getMessageStatus(messageID, type) {
    return WickrIOAPI.cmdGetMessageStatus(messageID, type, '0', '1000');
  }

  static getMessageIDEntry(messageID) {
    return WickrIOAPI.cmdGetMessageIDEntry(messageID);
  }

  static sendRoomMessage(vGroupID, message) {
    return WickrIOAPI.cmdSendRoomMessage(vGroupID, message);
  }

  static sendMessageUserHashFile(filePath, message, messageID) {
    return WickrIOAPI.cmdSendMessageUserHashFile(filePath, message, '', '', messageID);
  }

  static sendMessageUserNameFile(filePath, message, messageID) {
    return WickrIOAPI.cmdSendMessageUserNameFile(filePath, message, '', '', messageID);
  }

  static sendAttachmentUserHashFile(filePath, attachment, display, messageID) {
    return WickrIOAPI.cmdSendAttachmentUserHashFile(filePath, attachment, display, '', '', messageID);
  }

  static sendAttachmentUserNameFile(filePath, attachment, display, messageID) {
    return WickrIOAPI.cmdSendAttachmentUserNameFile(filePath, attachment, display, '', '', messageID);
  }
}

module.exports = APIService;
