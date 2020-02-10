
const BroadcastService = require('../broadcast-service');
const broadcast = require('./send-broadcast.js');
const logger = require('../logger');
const state = require('../state');

const broadcastService = new BroadcastService();

class ChooseFile {
  shouldExecute() {
  }

  execute(index) {
    let reply = null;
    let obj;
    const fileArr = broadcastService.getFileArr();
    const length = Math.min(fileArr.length, 5);
    if (!this.isInt(index) || index < 1 || index > length) {
      reply = `Index: ${index} is out of range. Please enter a number between 1 and ${length}`;
      obj = {
        reply,
        state: state.CHOOSE_FILE,
      };
    } else {
      // logger.debug('here is the other fileArr', fileArr, '\n');
      // TODO matt distracted fix later
      reply = 'Message sent to users from the file: ';
      const fileName = fileArr[parseInt(index, 10) - 1];
      reply += fileName;
      broadcastService.broadcastToFile(fileName);
      obj = {
        reply,
        state: state.NONE,
      };
    }
    return obj;
  }

  isInt(value) {
    return !isNaN(value) && (function (x) { return (x | 0) === x; }(parseFloat(value)));
  }
}

module.exports = ChooseFile;
