const logger = require('./logger');
const Help = require('./commands/help');
const FilesCommand = require('./commands/files-command');
const FileReceived = require('./commands/file-received');
const InitializeBroadcast = require('./commands/initialize-broadcast');
const InitializeSend = require('./commands/initialize-send');
const state = require('./state');
const Status = require('./commands/status');
const WhichMessage = require('./commands/which-message');
const ChooseFile = require('./commands/choose-file');
const Cancel = require('./commands/cancel');
const AskForAck = require('./commands/ask-for-ack');
const ChooseSecurityGroups = require('./commands/choose-security-groups');
const ConfirmSecurityGroups = require('./commands/confirm-security-groups');
const AskRepeat = require('./commands/ask-repeat');
const TimesRepeat = require('./commands/times-repeat');
// const InitializeSend = require('./commands/initialize-send');

// TODO how can we use a new Broadcast service each time???
class Factory {
  // TODO add send service
  constructor(broadcastService, statusService) {
    this.broadcastService = broadcastService;
    this.statusService = statusService;
    this.initializeBroadcast = new InitializeBroadcast(this.broadcastService);
    this.chooseFile = new ChooseFile(this.broadcastService);
    this.fileReceived = new FileReceived(this.broadcastService);
    this.filesCommand = new FilesCommand(this.broadcastService);
    this.askForAck = new AskForAck(this.broadcastService);
    this.confirmSecurityGroups = new ConfirmSecurityGroups(this.broadcastService);
    this.chooseSecurityGroups = new ChooseSecurityGroups(this.broadcastService);
    this.askRepeat = new AskRepeat(this.broadcastService);
    this.timesRepeat = new TimesRepeat(this.broadcastService);
    // TODO bring send to file back in
    // this.initializeSend = new InitializeSend(
    this.commandList = [
      Help,
      Cancel,
      this.filesCommand,
      this.initializeBroadcast,
      this.chooseFile,
      Status,
      WhichMessage,
      this.askForAck,
      this.chooseSecurityGroups,
      this.confirmSecurityGroups,
      this.askRepeat,
      this.timesRepeat,
    ];
  }

  execute(messageService) {
    // this.commandList.forEach((command) => {
    for (const command of this.commandList) {
      if (command.shouldExecute(messageService)) {
        return command.execute(messageService);
      }
    }
    // TODO fix the admin command returning this then add it back
    // return {
    //   reply: 'Command not recognized send the command /help for a list of commands',
    //   state: state.NONE,
    // };
  }

  file(file, display) {
    this.broadcastService.setFile(file);
    this.broadcastService.setDisplay(display);
    return this.fileReceived.execute();
  }
}

module.exports = Factory;
