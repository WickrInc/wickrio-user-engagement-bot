const logger = require('../logger');
const state = require('../state');

// TODO add a delete file command??
class FileCommand {
  constructor(broadcastService) {
    this.broadcastService = broadcastService;
  }

  shouldExecute() {

  }

  execute() {
    let reply = 'Here is a list of the files to which you can send a message:\n';
    const fileArr = this.broadcastService.getFiles();
    // logger.debug('Here is the fileArr: ', fileArr, '\nAnd the messageToSend:', messageToSend);
    const length = Math.min(fileArr.length, 5);
    for (let index = 0; index < length; index++) {
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
