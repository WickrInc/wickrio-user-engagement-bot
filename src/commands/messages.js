'use strict'

const logger = require('../logger');
const state = require('../state');

const broadcastService = new BroadcastService();

//TODO use this instead of putting it in main!
class Messages {
  shouldExecute() {

  }

  execute() {
    let reply = '';
    var path = process.cwd() + "/attachments/messages.txt";
    var uMessage = WickrIOAPI.cmdSendRoomAttachment(vGroupID, path, path);
    const obj = {
      reply,
      state: state.NONE,
    };
    return obj;
  }

}

module.exports = Messages;
