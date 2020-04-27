const logger = require('../logger');
const State = require('../state');

class TimesRepeat {
  constructor(broadcastService) {
    this.broadcastService = broadcastService;
    this.state = State.ASK_REPEAT;
  }

  shouldExecute(messageService) {
    // TODO could remove the /broadcast check if done right
    if (messageService.getCurrentState() === this.state) {
      return true;
    }
    return false;
  }

  execute(messageService) {
    let state;
    let reply;
    if (messageService.getMessage()) {

    }
    return {
      reply,
      state,
    };
  }
}

module.exports = TimesRepeat;
