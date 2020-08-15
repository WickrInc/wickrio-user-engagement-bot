import WickrIOAPI from 'wickrio_addon'
import logger from '../helpers/logger'
import state from '../state'

class InitializeStatus {
  constructor(statusService) {
    this.statusService = statusService
    this.commandString = '/status'
  }

  shouldExecute(messageService) {
    if (messageService.getCommand() === this.commandString) {
      return true
    }
    return false
  }

  execute(messageService) {
    const currentEntries = this.statusService.initMessageEntries(
      messageService.getUserEmail()
    )
    // logger.debug(`here are the messages:${currentEntries}`);
    let reply = ''
    let obj
    if (currentEntries.length < 1) {
      reply = 'There are no previous messages to display'
      obj = {
        reply,
        state: state.NONE,
      }
    } else {
      const length = Math.min(currentEntries.length, 5)
      let contentData
      let index = 1
      const messageList = []
      let messageString = ''
      // for (let entry of messageIdEntries) {
      for (let i = 0; i < currentEntries.length; i += 1) {
        contentData = WickrIOAPI.cmdGetMessageIDEntry(
          currentEntries[i].message_id
        )
        const contentParsed = JSON.parse(contentData)
        messageList.push(contentParsed.message)
        messageString += `(${index}) ${contentParsed.message}\n`
        index += 1
      }
      reply =
        `Here are the past ${length} broadcast message(s):\n` +
        `${messageString}` +
        'Which message would you like to see the status of?'
      obj = {
        reply,
        state: state.WHICH_MESSAGE,
      }
    }
    return obj
  }
}

module.exports = InitializeStatus
