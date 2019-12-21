
const BroadcastService = require('../broadcast-service');
const logger = require('../logger');
const state = require('../state');

const broadcastService = new BroadcastService();

class InitializeBroadcast {
  shouldExecute() {

  }

  execute() {
    let reply = 'To which list would you like to send your message:\n';
    const fileArr = broadcastService.getFiles();
    // logger.debug('Here is the fileArr: ', fileArr, '\nAnd the messageToSend:', messageToSend);
    const length = Math.min(fileArr.length, 5);
    for (let index = 0; index < length; index++) {
      reply += `(${index + 1}) ${fileArr[index]}\n`;
    }
    const obj = {
      reply,
      state: state.CHOOSE_FILE,
    };
    return obj;
  }
}

module.exports = InitializeBroadcast;
