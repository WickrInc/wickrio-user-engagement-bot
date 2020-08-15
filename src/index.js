import fs from 'fs'
// const {exec, execSync, execFileSync} = require('child_process');
import WickrIOAPI from 'wickrio_addon'
import WickrIOBotAPI from 'wickrio-bot-api'

// const pkgjson = require('./package.json');
import writer from './helpers/message-writer.js'
import logger from './logger'
// const WhitelistRepository = require('./src/helpers/whitelist');
import Version from './commands/version'

import FileHandler from './helpers/file-handler'
import Factory from './factory'
import State from './state'
import BroadcastService from './broadcast-service'
import MessageService from './message-service'
import StatusService from './status-service'

const { WickrUser } = WickrIOBotAPI
const bot = new WickrIOBotAPI.WickrIOBot()
let currentState

const fileHandler = new FileHandler()
// const whitelist = new WhitelistRepository(fs);
const broadcastService = new BroadcastService()
const statusService = new StatusService()

const factory = new Factory(broadcastService, statusService)

let file
let filename

process.stdin.resume() // so the program will not close instantly
if (!fs.existsSync(`${process.cwd()}/attachments`)) {
  fs.mkdirSync(`${process.cwd()}/attachments`)
}
if (!fs.existsSync(`${process.cwd()}/files`)) {
  fs.mkdirSync(`${process.cwd()}/files`)
}

async function exitHandler(options, err) {
  try {
    const closed = await bot.close()
    if (err || options.exit) {
      logger.error('Exit reason:', err)
      process.exit()
    } else if (options.pid) {
      process.kill(process.pid)
    }
  } catch (err) {
    logger.error(err)
  }
}

// catches ctrl+c and stop.sh events
process.on('SIGINT', exitHandler.bind(null, { exit: true }))

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { pid: true }))
process.on('SIGUSR2', exitHandler.bind(null, { pid: true }))

// catches uncaught exceptions
// TODO make this more robust of a catch
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))

async function main() {
  console.log('Entering main!')
  try {
    const tokens = JSON.parse(process.env.tokens)
    const status = await bot.start(tokens.WICKRIO_BOT_NAME.value)
    if (!status) {
      exitHandler(null, {
        exit: true,
        reason: 'Client not able to start',
      })
    }

    // TODO set to true and send from a non admin and see what happens
    bot.setAdminOnly(false)

    WickrIOAPI.cmdSetControl('cleardb', 'true')
    WickrIOAPI.cmdSetControl('contactbackup', 'false')
    WickrIOAPI.cmdSetControl('convobackup', 'false')
    // Passes a callback function that will receive incoming messages into the bot client
    bot.startListening(listen)
    // await bot.startListening(listen); //Passes a callback function that will receive incoming messages into the bot client
  } catch (err) {
    console.log(err)
  }
}

async function listen(message) {
  try {
    // TODO fix the parseMessage function so it can include control messages
    // TODO add a parseMessage that can get the important parts and leave out recipients
    // Parses an incoming message and returns an object with command, argument, vGroupID and Sender fields
    const parsedMessage = bot.parseMessage(message)
    if (!parsedMessage) {
      await writer.writeFile(message)
      return
    }
    logger.debug('New incoming Message:', parsedMessage)
    let wickrUser
    const fullMessage = parsedMessage.message
    let { command } = parsedMessage
    if (command !== undefined) {
      command = command.toLowerCase().trim()
    }
    if (!command) {
      logger.debug('Command is empty!')
      // writer.writeFile(message);
    }
    // TODO what's the difference between full message and message
    const messageReceived = parsedMessage.message
    const { argument } = parsedMessage
    const { userEmail } = parsedMessage
    const vGroupID = parsedMessage.vgroupid
    const convoType = parsedMessage.convotype
    const personal_vGroupID = ''
    logger.debug(`convoType=${convoType}`)
    // Go back to dev toolkit and fix
    /*
    if(convoType === 'personal') {
      personal_vGroupID = vGroupID;
    } else {
      writer.writeFile(message);
      return;
    }
    */
    if (command === '/version') {
      const obj = Version.execute()
      const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, obj.reply)
      return
    }

    // put this in it's own command
    if (command === '/help') {
      const helpstring =
        '*Messaging Commands*\n' +
        '*Admin Commands*\n' +
        '%{adminHelp}\n' +
        '*Send Commands*\n' +
        '/send : start sending to a directory of random users\n' +
        '/cancel : stop sending to the directroy\n' +
        '*Other Commands*\n' +
        '/help : Show help information\n' +
        '/version : Show the version numbers'
      const reply = bot.getAdminHelp(helpstring)
      const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply)
      logger.debug(sMessage)
      return
    }

    if (!parsedMessage.isAdmin) {
      const reply =
        "Hey, this bot is just for announcements and can't respond to you personally. If you have a question, please get a hold of us a support@wickr.com or visit us a support.wickr.com. Thanks, Team Wickr"
      const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply)
      logger.debug(sMessage)
      writer.writeFile(message)
      return
    }

    // TODO move this elsewhere?
    if (command === '/messages') {
      const path = `${process.cwd()}/attachments/messages.txt`
      const uMessage = WickrIOAPI.cmdSendRoomAttachment(vGroupID, path, path)
      return
    }

    let user = bot.getUser(userEmail) // Look up user by their wickr email

    if (user === undefined) {
      // Check if a user exists in the database
      wickrUser = new WickrUser(userEmail, {
        index: 0,
        vGroupID,
        personal_vGroupID,
        command: '',
        argument: '',
        confirm: '',
        type: '',
      })
      user = bot.addUser(wickrUser) // Add a new user to the database
    }
    logger.debug('user:', user)

    const messageService = new MessageService(
      messageReceived,
      userEmail,
      argument,
      command,
      currentState
    )

    // TODO is this JSON.stringify necessary??
    // How to deal with duplicate files??
    if (currentState === State.FILE_TYPE) {
      currentState = State.NONE
      const type = parsedMessage.message.toLowerCase()
      let fileAppend = ''
      logger.debug(`Here is the filetype message${type}`)
      if (type === 'u' || type === 'user') {
        fileAppend = '.user'
      } else if (type === 'h' || type === 'hash') {
        fileAppend = '.hash'
      } else if (type === 's' || type === 'send') {
        // TODO fix this
        // sendFile.execute();
        command = '/broadcast'
        const obj = factory.execute(
          currentState,
          command,
          argument,
          parsedMessage.message,
          userEmail
        )
        if (obj.reply) {
          logger.debug('Object has a reply')
          const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, obj.reply)
        }
        currentState = obj.state
      } else {
        const reply =
          'Input not recognized please reply with (u)ser, (h)ash, or (s)end.'
        const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply)
        currentState = State.FILE_TYPE
      }
      if (fileAppend) {
        logger.debug(`Here is file info${file}`)
        const cp = await fileHandler.copyFile(
          file.toString(),
          `${process.cwd()}/files/${filename.toString()}${fileAppend}`
        )
        logger.debug(`Here is cp:${cp}`)
        if (cp) {
          const reply = `File named: ${filename} successfully saved to directory.`
          const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply)
        } else {
          const reply = `Error: File named: ${filename} not saved to directory.`
          const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply)
        }
      }
    } else {
      // TODO parse argument better??
      let obj
      if (parsedMessage.file) {
        obj = factory.file(parsedMessage.file, parsedMessage.filename)
        file = parsedMessage.file
        filename = parsedMessage.filename
      } else {
        // obj = factory.execute(currentState, command, argument, parsedMessage.message, userEmail);
        obj = factory.newExecute(messageService)
      }
      if (obj.reply) {
        logger.debug('Object has a reply')
        const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, obj.reply)
      }
      currentState = obj.state
    }
  } catch (err) {
    logger.error(err)
    logger.error('Got an error')
  }
}

function affirmativeReply(message) {
  return message.toLowerCase() === 'yes' || message.toLowerCase() === 'y'
}

function negativeReply(message) {
  return message.toLowerCase() === 'no' || message.toLowerCase() === 'n'
}

function replyWithButtons(message) {
  const button1 = {
    type: 'message',
    text: 'Yes',
    message: 'yes',
  }
  const button2 = {
    type: 'message',
    text: 'No',
    message: 'no',
  }
  const buttons = [button1, button2]

  const bMessage = WickrIOAPI.cmdSendNetworkMessage(
    broadcastMsgToSend,
    '',
    '',
    messageID,
    flags,
    buttons
  )
}

main()
