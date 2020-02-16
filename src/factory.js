
const broadcast = require('./commands/broadcast');
const help = require('./commands/help');
const Admin = require('./commands/admin');
const FilesCommand = require('./commands/files-command');
const FileReceived = require('./commands/file-received.js');
const FileType = require('./commands/file-type.js');
const state = require('./state');
const msgStatus = require('./commands/status');
const logger = require('./logger');
const chooseFile = require('./commands/choose-file');

const WhitelistRepository = require('./helpers/whitelist');

const admin = new Admin(new WhitelistRepository());
const filesCommand = new FilesCommand();
const fileReceived = new FileReceived();
const fileType = new FileType();

// TODO fix this!
class Factory {
  factory(currentState, command, arg, message, userEmail, parsedMessage, file) {
    let obj;
    // if (file) {
      // obj = fileReceived.execute();
    // } else if (currentState === state.FILE_TYPE) {
      // obj = await fileType.execute(message);
    // } else 
    if (command === '/help') {
      obj = help.help();
    } else if (command === '/cancel') {
      // TODO turn this into a file!
      const reply = 'Previous command canceled, send a new command or enter /help for a list of commands.';
      obj = {
        reply,
        state: state.NONE,
      };
    } else if (command === '/files') {
      obj = filesCommand.execute();
    } else if (command === '/broadcast') {
      obj = broadcast.startBroadcast(arg, userEmail);
    } else if (currentState === state.CHOOSE_FILE) {
      obj = broadcast.fileChosen(message);
    } else if (command === '/status') {
      obj = msgStatus.askStatus(userEmail);
    } else if (currentState === state.WHICH_MESSAGE) {
      obj = msgStatus.messageChosen(message);
    } else if (command === '/admin') {
      const argList = arg.split(' ');
      logger.debug(argList);
      if (argList[0] === 'list') {
        obj = admin.list();
      } else if (argList[0] === 'add') {
        // TODO start here!
        argList.shift();
        logger.debug('arglist shifted', argList);
        obj = admin.add(userEmail, argList);
      } else if (argList[0] === 'remove') {
        argList.shift();
        obj = admin.remove(userEmail, argList);
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
}

module.exports = Factory;
