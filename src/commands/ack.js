const state = require('../state');
const GenericService = require('../services/generic-service');


class Ack {
  constructor(genericService) {
    this.genericService = genericService;
    this.commandString = '/ack';
  }

  shouldExecute(messageService) {
    if (messageService.getCommand() === this.commandString) {
      return true;
    }
    return false;
  }

  execute(messageService) {
    GenericService.genericService.setMessageStatus('', messageService.getUserEmail(), '3', '');
    const reply = '';
    const obj = {
      reply,
      state: state.NONE,
    };
    return obj;
  }
}

module.exports = Ack;
