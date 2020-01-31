
const BroadcastService = require('../broadcast-service');
const logger = require('../logger');
const state = require('../state');

const broadcastService = new BroadcastService();

class InitializeBroadcast {
  shouldExecute() {

  }

  execute() {
    const fileArr = broadcastService.getFiles();
    const length = Math.min(fileArr.length, 5);
    if (length > 0) {
      let reply = 'To which list would you like to send your message:\n';
      for (let index = 0; index < length; index++) {
        reply += `(${index + 1}) ${fileArr[index]}\n`;
      }
      const obj = {
        reply,
        state: state.CHOOSE_FILE,
      };
      return obj;
    } else {
      let reply = 'There are no files available to send. Please upload file for broadcast first.';
      const obj = {
        reply,
        state: state.NONE,
      };
      return obj;
    }
  }
}

module.exports = InitializeBroadcast;
