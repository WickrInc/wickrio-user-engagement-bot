const Help = require('./commands/help');
// const Admin = require('./commands/admin');
const FilesCommand = require('./commands/files-command');
const FileReceived = require('./commands/file-received');
const InitializeBroadcast = require('./commands/initialize-broadcast');
const InitializeStatus = require('./commands/initialize-status');
const state = require('./state');
const Status = require('./commands/status');
const logger = require('./logger');
const ChooseFile = require('./commands/choose-file');
const Cancel = require('./commands/cancel');
// const BroadcastService = require('./broadcast-service');

// TODO how can we use a new Broadcast service each time???
class Factory {
  constructor(broadcastService, statusService) {
    // this.admin = new Admin(whitelist);
    this.broadcastService = broadcastService;
    this.statusService = statusService;
    this.initializeBroadcast = new InitializeBroadcast(this.broadcastService);
    this.chooseFile = new ChooseFile(this.broadcastService);
    this.fileReceived = new FileReceived(this.broadcastService);
    this.filesCommand = new FilesCommand(this.broadcastService);
    this.initializeStatus = new InitializeStatus(this.statusService);
    this.statusCommand = new Status(this.statusService);
    this.commandList = [
      Help,
      Cancel,
      this.filesCommand,
      this.initializeBroadcast,
      this.chooseFile,
      this.initializeStatus,
      this.statusCommand,
    ];
  }

  newExecute(messageService) {
    let obj;
    // let obj = {
    //   reply: 'Command not recognized send the command /help for a list of commands',
    //   state: state.NONE,
    // };
    for (const command of this.commandList) {
      logger.debug(`command${command}`);
      if (command.shouldExecute(messageService)) {
        obj = command.execute(messageService);
        break;
      }
    }
    return obj;
  }

  execute(currentState, command, arg, message, userEmail) {
    let obj;
    if (command === '/help') {
      obj = Help.execute();
    } else if (Cancel.shouldExecute(command)) {
      obj = Cancel.execute();
    } else if (command === '/files') {
      obj = this.filesCommand.execute();
    } else if (command === '/broadcast') {
      obj = this.initializeBroadcast.execute(arg, userEmail);
    } else if (currentState === state.CHOOSE_FILE) {
      obj = this.chooseFile.execute(message);
    } else if (command === '/status') {
      // obj = msgStatus.askStatus(userEmail);
    } else if (currentState === state.WHICH_MESSAGE) {
      // obj = msgStatus.messageChosen(message);
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

  file(file, displayName) {
    this.broadcastService.setFileToSend(file);
    this.broadcastService.setDisplayName(displayName);
    return this.fileReceived.execute();
  }
}

module.exports = Factory;
