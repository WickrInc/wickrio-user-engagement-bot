const logger = require('../logger');
const State = require('../state');
const StatusService = require('../status-service');

class Status {
  constructor(statusService) {
    this.statusService = statusService;
    this.state = State.WHICH_MESSAGE;
  }

  shouldExecute(messageService) {
    if (messageService.getCurrentState() === this.state) {
      return true;
    }
    return false;
  }

  execute(messageService) {
    let reply;
    const currentEntries = this.statusService.getMessageEntries();
    let obj;
    const index = messageService.getMessage();
    const length = Math.min(currentEntries.length, 5);
    if (!messageService.isInt() || index < 1 || index > length) {
      reply = `Index: ${index} is out of range. Please enter a number between 1 and ${length}`;
      obj = {
        reply,
        state: State.WHICH_MESSAGE,
      };
    } else {
      const messageID = `${currentEntries[parseInt(index, 10) - 1].message_id}`;
      reply = StatusService.getStatus(messageID, 'summary', false);
      obj = {
        reply,
        state: State.NONE,
      };
    }
    return obj;
  }
}

module.exports = Status;
