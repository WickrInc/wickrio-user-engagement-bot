const logger = require('../logger');
const State = require('../state');

class InitializeBroadcast {
  constructor(broadcastService) {
    this.broadcastService = broadcastService;
    this.commandString = '/broadcast';
  }

  shouldExecute(messageService) {
    if (messageService.getCommand() === this.commandString) {
      logger.debug('We should');
      return true;
    }
    return false;
  }

  execute(messageService) {
    logger.debug('We did');
    this.broadcastService.setMessage(messageService.getArgument());
    this.broadcastService.setUserEmail(messageService.getUserEmail());
    let reply = 'Would you like to ask the recipients for an acknowledgement?';
    let state = State.ASK_FOR_ACK;
    // TODO check for undefined??
    if (!messageService.getArgument() || messageService.getArgument().length === 0) {
      reply = 'Must have a message or file to broadcast, Usage: /broadcast <message>';
      state = State.NONE;
    }
    return {
      reply,
      state,
    };
  }
}

module.exports = InitializeBroadcast;
