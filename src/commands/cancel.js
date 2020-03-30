const state = require('../state');


class Cancel {
  static shouldExecute(command) {
    if (command === '/cancel') {
      return true;
    }
    return false;
  }

  static execute() {
    const reply = 'Previous command canceled, send a new command or enter /help for a list of commands.';
    const obj = {
      reply,
      state: state.NONE,
    };
    return obj;
  }
}

module.exports = Cancel;
