const broadcast = require('./commands/broadcast');
const help = require('./commands/help');
const Admin = require('./commands/admin');
const FilesCommand = require('./commands/files-command');
const FileReceived = require('./commands/file-received');
const InitializeBroadcast = require('./commands/initialize-broadcast');
const state = require('./state');
const msgStatus = require('./commands/status');
const logger = require('./logger');
const ChooseFile = require('./commands/choose-file');
const Cancel = require('./commands/cancel');
const sendFile = require('./commands/send-file');
const BroadcastService = require('./broadcast-service');

const filesCommand = new FilesCommand();
// TODO how can we use a new Broadcast service each time???
class Factory {
  constructor(whitelist) {
    this.admin = new Admin(whitelist);
    this.broadcastService = new BroadcastService();
    this.initializeBroadcast = new InitializeBroadcast(this.broadcastService);
    this.chooseFile = new ChooseFile(this.broadcastService);
    this.fileReceived = new FileReceived(this.broadcastService);
  }

  execute(currentState, command, arg, message, userEmail) {
    let obj;
    if (command === '/help') {
      obj = help.help();
    } else if (command === '/cancel') {
      obj = Cancel.execute();
    } else if (command === '/files') {
      obj = filesCommand.execute(arg);
    } else if (command === '/broadcast') {
      obj = this.initializeBroadcast.execute(arg, userEmail);
    } else if (currentState === state.CHOOSE_FILE) {
      // obj = broadcast.fileChosen(message);
      obj = this.chooseFile.execute(message);
    } else if (command === '/status') {
      obj = msgStatus.askStatus(userEmail);
    } else if (currentState === state.WHICH_MESSAGE) {
      obj = msgStatus.messageChosen(message);
    } else if (command === '/admin') {
      const argList = arg.split(' ');
      logger.debug(argList);
      if (argList[0] === 'list') {
        logger.debug('arglist = list');
        obj = this.admin.list();
      } else if (argList[0] === 'add') {
        argList.shift();
        logger.debug('arglist shifted', argList);
        obj = this.admin.add(userEmail, argList);
      } else if (argList[0] === 'remove') {
        argList.shift();
        // TODO return obj is undefined
        obj = this.admin.remove(userEmail, argList);
      } else {
        const reply = 'Invalid /admin command, usage:\n/admin list|add <user(s)>|remove <user(s)>';
        obj = {
          reply,
          state: state.NONE,
        };
      }
      logger.debug('here is the obj', obj.reply, '\nand the state:\n', obj.state);
    } else {
      logger.debug('command', command);
    }
    return obj;
  }

  // this.fileReceived(currentState, command, arg, message, userEmail, parsedMessage, file) {
  file(file, displayName) {
    this.broadcastService.setFileToSend(file);
    this.broadcastService.setDisplayName(displayName);
    return this.fileReceived.execute();
  }
}

module.exports = Factory;
