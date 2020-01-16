
const broadcast = require('./commands/broadcast');
const help = require('./commands/help');
const Admin = require('./commands/admin');
const state = require('./state');
const msgStatus = require('./commands/status');
const logger = require('./logger');
const chooseFile = require('./commands/choose-file');
// TODO fix this!! get userEmail from somewhere
const userEmail = 'torenwickr';

const WhitelistRepository = require('./helpers/whitelist');

const admin = new Admin(new WhitelistRepository());

// TODO fix this!
module.exports = {
  factory(currentState, command, arg, message) {
    let obj;
    if (command === '/help') {
      // console.log('Before new promise');
      obj = help.help();
      // return Promise.resolve(help.help());
    } else if (command === '/broadcast') {
      obj = broadcast.startBroadcast(arg);
    } else if (currentState === state.CHOOSE_FILE) {
      obj = broadcast.fileChosen(message);
    } else if (command === '/status') {
      obj = msgStatus.askStatus(userEmail);
    } else if (currentState === state.WHICH_MESSAGE) {
      obj = msgStatus.messageChosen(message);
    } else if (command === '/admin') {
      const argList = arg.split(' ');
      logger.debug(argList);
      for (const argument of argList) {
        logger.debug(argument);
      }
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
    } else {
      logger.debug('command', command);
    }
    logger.debug('here is the obj', obj.reply, '\nand the state:\n', obj.state);
    return obj;
  },
};
