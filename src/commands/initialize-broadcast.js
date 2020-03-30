const logger = require('../logger');
const state = require('../state');

class InitializeBroadcast {
  constructor(broadcastService) {
    this.broadcastService = broadcastService;
    this.commandString = 'send';
  }

  shouldExecute(command) {
    if (command === this.commandString) {
      return true;
    }
    return false;
  }

  execute(message, userEmail) {
    this.broadcastService.setMessageToSend(message);
    this.broadcastService.setUserEmail(userEmail);
    const fileArr = this.broadcastService.getFiles();
    const length = Math.min(fileArr.length, 5);
    let reply;
    logger.debug(`message:${message}userEmail:${userEmail}`);
    // TODO check for undefined??
    if (!message || !message.length === 0) {
      reply = 'Must have a message or file to broadcast, Usage: /broadcast <message>';
    }
    if (length > 0) {
      reply = 'To which list would you like to send your message:\n';
      for (let index = 0; index < length; index += 1) {
        reply += `(${index + 1}) ${fileArr[index]}\n`;
      }
      const obj = {
        reply,
        state: state.CHOOSE_FILE,
      };
      return obj;
    }
    reply = 'There are no files available to send to. Please upload file for broadcast first.';
    const obj = {
      reply,
      state: state.NONE,
    };
    return obj;
  }
}

module.exports = InitializeBroadcast;
