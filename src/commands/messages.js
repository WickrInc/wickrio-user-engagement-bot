// import logger from '../logger'
import state from '../state'
import WickrIOAPI from 'wickrio_addon'

// TODO use this instead of putting it in main!
class Messages {
  static shouldExecute(messageService) {
    if (messageService.getCommand() === '/messages') {
      return true
    }
    return false
  }

  static execute() {
    console.log('vGroupID is undefined here', vGroupID)
    const reply = ''
    const path = `${process.cwd()}/attachments/messages.txt`
    WickrIOAPI.cmdSendRoomAttachment(vGroupID, path, path)
    const obj = {
      reply,
      state: state.NONE,
    }
    return obj
  }
}

module.exports = Messages
