class MessageService {
  constructor(message, userEmail, argument, command, currentState) {
    this.message = message;
    this.userEmail = userEmail;
    this.argument = argument;
    this.command = command;
    this.currentState = currentState;
  }

  // TODO why use getters and setters here??
  getMessage() {
    return this.message;
  }

  getArgument() {
    return this.argument;
  }

  getUserEmail() {
    return this.userEmail;
  }

  getCommand() {
    return this.command;
  }

  getCurrentState() {
    return this.currentState;
  }

  affirmativeReply() {
    return this.message.toLowerCase() === 'yes' || this.message.toLowerCase() === 'y';
  }

  negativeReply() {
    return this.message.toLowerCase() === 'no' || this.message.toLowerCase() === 'n';
  }

  // TODO check if this works as expected
  isInt() {
    return !(Number.isNaN(this.message));
  }


  static replyWithButtons(message) {
    const button1 = {
      type: 'message',
      text: 'Yes',
      message: 'yes',
    };
    const button2 = {
      type: 'message',
      text: 'No',
      message: 'no',
    };
    const buttons = [button1, button2];
    // Send message with buttons here
  }
}

module.exports = MessageService;
