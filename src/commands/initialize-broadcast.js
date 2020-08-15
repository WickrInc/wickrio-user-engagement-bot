import logger from '../helpers/logger'
import state from '../state'

class InitializeBroadcast {
  constructor(broadcastService) {
    this.broadcastService = broadcastService
    this.commandString = '/send'
  }

  shouldExecute(messageService) {
    if (messageService.getCommand() === this.commandString) {
      return true
    }
    return false
  }

  execute(messageService) {
    this.broadcastService.setMessageToSend(messageService.getArgument())
    this.broadcastService.setUserEmail(messageService.getUserEmail())
    const fileArr = this.broadcastService.getFiles()
    const length = Math.min(fileArr.length, 5)
    let reply
    logger.debug(
      `message:${messageService.getMessage()}userEmail:${messageService.getUserEmail()}`
    )
    // TODO check for undefined??
    if (
      !messageService.getMessage() ||
      !messageService.getMessage().length === 0
    ) {
      reply =
        'Must have a message or file to broadcast, Usage: /broadcast <message>'
    }
    if (length > 0) {
      reply = 'To which list would you like to send your message:\n'
      for (let index = 0; index < length; index += 1) {
        reply += `(${index + 1}) ${fileArr[index]}\n`
      }
      const obj = {
        reply,
        state: state.CHOOSE_FILE,
      }
      return obj
    }
    reply =
      'There are no files available to send to. Please upload file for broadcast first.'
    const obj = {
      reply,
      state: state.NONE,
    }
    return obj
  }
}

module.exports = InitializeBroadcast
