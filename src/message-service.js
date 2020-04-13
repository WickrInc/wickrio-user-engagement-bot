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
}

module.exports = MessageService;
