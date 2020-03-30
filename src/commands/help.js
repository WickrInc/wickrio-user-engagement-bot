const state = require('../state');

class Help {
  static shouldExecute(command) {
    if (command === '/help') {
      return true;
    }
    return false;
  }

  static execute() {
    const reply = '*Messages Commands*\n'
    + '/broadcast <Message> : to send a broadcast message to a given file of user hashes or usernames\n'
    + '/messages get a text file of all the messages sent to the user engagement bot\n'
    + '/status : To get status of a broadcast message \n\n'
    + '*Admin Commands*\n'
    + '/admin list : Get list of admin users \n'
    + '/admin add <users> : Add one or more admin users \n'
    + '/admin remove <users> : Remove one or more admin users \n\n'
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
