const logger = require('../logger');
const state = require('../state');

// TODO add a delete file command??
class FileCommand {
  // TODO is this the proper way? or should should execute be static?
  constructor(broadcastService) {
    this.broadcastService = broadcastService;
    this.commandString = '/files';
  }

  shouldExecute(command) {
    if (command === this.commandString) {
      return true;
    }
    return false;
  }

  execute() {
    let reply = 'Here is a list of the files to which you can send a message:\n';
    const fileArr = this.broadcastService.getFiles();
    const length = Math.min(fileArr.length, 5);
    for (let index = 0; index < length; index += 1) {
      reply += `(${index + 1}) ${fileArr[index]}\n`;
    }
    const obj = {
      reply,
      state: state.NONE,
    };
    return obj;
  }
}

module.exports = FileCommand;
