const state = require('../state');
const logger = require('../logger');

class Help {
  static shouldExecute(messageService) {
    logger.trace('Inside should execute');
    if (messageService.getCommand() === '/help') {
      return true;
    }
    return false;
  }

  static execute() {
    const reply = '*Messages Commands*\n'
      + '/send <Message> : to send a broadcast message to a given file of user hashes or usernames\n'
      + '/messages get a text file of all the messages sent to the user engagement bot\n'
      + '/status : To get status of a broadcast message \n\n'
      + '*Admin Commands*\n'
      + '%{adminHelp}\n'
      + '*Other Commands*\n'
      + '/help : Show help information\n'
      + '/version : Get the version of the integration\n'
      + '/cancel : To cancel the last operation and enter a new command\n'
      + '/files : To get a list of saved files that can be broadcast to';
    return {
      reply,
      state: state.NONE,
    };
  }
}


module.exports = Help;
