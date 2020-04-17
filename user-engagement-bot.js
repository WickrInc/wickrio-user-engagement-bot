const fs = require('fs');
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const helmet = require('helmet')
const app = express();
app.use(helmet()); //security http headers

// const {exec, execSync, execFileSync} = require('child_process');
const WickrIOAPI = require('wickrio_addon');
const WickrIOBotAPI = require('wickrio-bot-api');

const { WickrUser } = WickrIOBotAPI;
const bot = new WickrIOBotAPI.WickrIOBot();
// const pkgjson = require('./package.json');
const writer = require('./src/helpers/message-writer.js');
const logger = require('./src/logger');
// const WhitelistRepository = require('./src/helpers/whitelist');
const Version = require('./src/commands/version');

const FileHandler = require('./src/helpers/file-handler');
const Factory = require('./src/factory');
const State = require('./src/state');
const BroadcastService = require('./src/broadcast-service');
const MessageService = require('./src/message-service');
const StatusService = require('./src/status-service');

let currentState;

var bot_port, bot_api_key, bot_api_auth_token;
var client_auth_codes = {};

const fileHandler = new FileHandler();
// const whitelist = new WhitelistRepository(fs);
const broadcastService = new BroadcastService();
const statusService = new StatusService();

const factory = new Factory(broadcastService, statusService);

let file;
let filename;

process.stdin.resume(); // so the program will not close instantly
if (!fs.existsSync(`${process.cwd()}/attachments`)) {
  fs.mkdirSync(`${process.cwd()}/attachments`);
}
if (!fs.existsSync(`${process.cwd()}/files`)) {
  fs.mkdirSync(`${process.cwd()}/files`);
}

async function exitHandler(options, err) {
  try {
    const closed = await bot.close();
    if (err || options.exit) {
      logger.error('Exit reason:', err);
      process.exit();
    } else if (options.pid) {
      process.kill(process.pid);
    }
  } catch (err) {
    logger.error(err);
  }
}

// catches ctrl+c and stop.sh events
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { pid: true }));
process.on('SIGUSR2', exitHandler.bind(null, { pid: true }));

// catches uncaught exceptions
// TODO make this more robust of a catch
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

//Basic function to validate credentials for example
function checkCreds(authToken) {
    try {
      var valid = true;
      const authStr = new Buffer(authToken, 'base64').toString();
      //implement authToken verification in here
      if (authStr !== bot_api_auth_token)
        valid = false;
      return valid;
    } catch (err) {
      console.log(err);
    }
}

function generateRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

async function main() {
  console.log('Entering main!');
  try {
    const tokens = JSON.parse(process.env.tokens);
    const status = await bot.start(tokens.WICKRIO_BOT_NAME.value);
    if (!status) {
      exitHandler(null, {
        exit: true,
        reason: 'Client not able to start',
      });
    }

    // TODO set to true and send from a non admin and see what happens
    bot.setAdminOnly(false);

    WickrIOAPI.cmdSetControl('cleardb', 'true');
    WickrIOAPI.cmdSetControl('contactbackup', 'false');
    WickrIOAPI.cmdSetControl('convobackup', 'false');
    // Passes a callback function that will receive incoming messages into the bot client
    bot.startListening(listen);

console.log('BOT_PORT='+tokens.BOT_PORT);
console.log('BOT_API_KEY='+tokens.BOT_API_KEY);
console.log('BOT_API_AUTH_TOKEN='+tokens.BOT_API_AUTH_TOKEN);

    // start up the web interface if one exists
    if (tokens.BOT_PORT !== undefined &&
        tokens.BOT_API_KEY != undefined &&
        tokens.BOT_API_AUTH_TOKEN != undefined) {
        bot_port = tokens.BOT_PORT.value;
        bot_api_key = tokens.BOT_API_KEY.value;
        bot_api_auth_token = tokens.BOT_API_AUTH_TOKEN.value;

        app.listen(bot_port, () => {
          console.log('We are live on ' + bot_port);
        });

        // parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({extended: false}));
        // parse application/json
        app.use(bodyParser.json());

        app.use(function(error, req, res, next) {
          if (error instanceof SyntaxError) {
            console.log('bodyParser:', error);
            res.statusCode = 400;
            res.type('txt').send(error.toString());
          } else {
            next();
          }
        });

        app.all('*', function(req, res, next) {
          next();
        });

        var endpoint = "/WickrIO/V1/Apps/" + bot_api_key;

        app.post(endpoint + "/Authenticate/:wickrUser", function(req, res) {
          res.set('Content-Type', 'text/plain');
          res.set('Authorization', 'Basic base64_auth_token');
          var authHeader = req.get('Authorization');
          var authToken;
          if (authHeader) {
            if (authHeader.indexOf(' ') == -1) {
              authToken = authHeader;
            } else {
              authHeader = authHeader.split(' ');
              authToken = authHeader[1];
            }
          } else {
            return res.status(401).send('Access denied: invalid Authorization Header format. Correct format: "Authorization: Basic base64_auth_token"');
          }
          if (!checkCreds(authToken)) {
            return res.status(401).send('Access denied: invalid basic-auth token.');
          } else {
            var wickrUser = req.params.wickrUser;
            if (typeof wickrUser !== 'string')
              return res.send("WickrUser must be a string.");
      
            var ttl = "", bor = "";
            var users = [];
            users.push(wickrUser);
      
            var random = generateRandomString(24);
            var message = "Authentication code: " + random;
      
            // Save the auth key for the wickrUser
            client_auth_codes[wickrUser] = random;
      
            try {
              var csm = WickrIOAPI.cmdSend1to1Message(users, message, ttl, bor);
              console.log(csm);
              res.send(csm);
            } catch (err) {
              console.log(err);
              res.statusCode = 400;
              res.send(err.toString());
            }
          }
        });
      
        app.post(endpoint + "/Broadcast/:wickrUser/:authCode", function(req, res) {
          res.set('Content-Type', 'text/plain');
          res.set('Authorization', 'Basic base64_auth_token');
          var authHeader = req.get('Authorization');
          var authToken;
          if (authHeader) {
            if (authHeader.indexOf(' ') == -1) {
              authToken = authHeader;
            } else {
              authHeader = authHeader.split(' ');
              authToken = authHeader[1];
            }
          } else {
            return res.status(401).send('Access denied: invalid Authorization Header format. Correct format: "Authorization: Basic base64_auth_token"');
          }
      
          if (!checkCreds(authToken)) {
            return res.status(401).send('Access denied: invalid basic-auth token.');
          }
      
          var wickrUser = req.params.wickrUser;
          if (typeof wickrUser !== 'string')
            return res.send("WickrUser must be a string.");
          var authCode = req.params.authCode;
          if (typeof authCode !== 'string')
            return res.send("Authentication Code must be a string.");
      
          // Check if the autoCode is valid for the input user
          var dictAuthCode = client_auth_codes[wickrUser];
          if (dictAuthCode === undefined || authCode != dictAuthCode) {
            return res.status(401).send('Access denied: invalid user authentication code.');
          }
          
//        message.insert("action", "broadcast");
//    message.insert("message", broadcastTextEdit->toPlainText() );
//    message.insert("target", 0);
//    message.insert("acknowledge", broadcastDialogOptionsWidget->isChecked() ? true : false);
//    message.insert("repeat", 0);
//    message.insert("pause", 0);


 
          if (!req.body.message) {
            return res.send("Broadcast message missing from request.");
          }
 
          var ttl = "", bor = "";
          var users = [];
          users.push(wickrUser);
      
          var message = req.body.message
 
          try {
            var csm = WickrIOAPI.cmdSend1to1Message(users, message, ttl, bor);
            console.log(csm);
            res.send(csm);
          } catch (err) {
            console.log(err);
            res.statusCode = 400;
            res.send(err.toString());
          }
        });
      
        // What to do for ALL requests for ALL Paths
        // that are not handled above
        app.all('*', function(req, res) {
          console.log('*** 404 ***');
          console.log('404 for url: ' + req.url);
          console.log('***********');
          return res.type('txt').status(404).send('Endpoint ' + req.url + ' not found');
        });
    }
  } catch (err) {
    console.log(err);
  }
}

async function listen(message) {
  try {
    // TODO fix the parseMessage function so it can include control messages
    // TODO add a parseMessage that can get the important parts and leave out recipients
    // Parses an incoming message and returns an object with command, argument, vGroupID and Sender fields
    const parsedMessage = bot.parseMessage(message);
    if (!parsedMessage) {
      await writer.writeFile(message);
      return;
    }
    logger.debug('New incoming Message:', parsedMessage);
    let wickrUser;
    const fullMessage = parsedMessage.message;
    let { command } = parsedMessage;
    if (command !== undefined) {
      command = command.toLowerCase().trim();
    } if (!command) {
      logger.debug('Command is empty!');
      // writer.writeFile(message);
    }
    // TODO what's the difference between full message and message
    const messageReceived = parsedMessage.message;
    const { argument } = parsedMessage;
    const { userEmail } = parsedMessage;
    const vGroupID = parsedMessage.vgroupid;
    const convoType = parsedMessage.convotype;
    const personal_vGroupID = '';
    logger.debug(`convoType=${convoType}`);
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
      const obj = Version.execute();
      const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, obj.reply);
      return;
    }

    // put this in it's own command
    if (command === '/help') {
      const helpstring = '*Messaging Commands*\n'
          + '*Admin Commands*\n'
          + '%{adminHelp}\n'
          + '*Send Commands*\n'
          + '/send : start sending to a directory of random users\n'
          + '/cancel : stop sending to the directroy\n'
          + '*Other Commands*\n'
          + '/help : Show help information\n'
          + '/version : Show the version numbers';
      const reply = bot.getAdminHelp(helpstring);
      const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
      logger.debug(sMessage);
      return;
    }

    if (!parsedMessage.isAdmin) {
      const reply = "Hey, this bot is just for announcements and can't respond to you personally. If you have a question, please get a hold of us a support@wickr.com or visit us a support.wickr.com. Thanks, Team Wickr";
      const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
      logger.debug(sMessage);
      writer.writeFile(message);
      return;
    }

    // TODO move this elsewhere?
    if (command === '/messages') {
      const path = `${process.cwd()}/attachments/messages.txt`;
      const uMessage = WickrIOAPI.cmdSendRoomAttachment(vGroupID, path, path);
      return;
    }

    let user = bot.getUser(userEmail); // Look up user by their wickr email

    if (user === undefined) { // Check if a user exists in the database
      wickrUser = new WickrUser(userEmail, {
        index: 0,
        vGroupID,
        personal_vGroupID,
        command: '',
        argument: '',
        confirm: '',
        type: '',
      });
      user = bot.addUser(wickrUser); // Add a new user to the database
    }
    logger.debug('user:', user);

    const messageService = new MessageService(messageReceived, userEmail, argument, command, currentState);

    // TODO is this JSON.stringify necessary??
    // How to deal with duplicate files??
    if (currentState === State.FILE_TYPE) {
      currentState = State.NONE;
      const type = parsedMessage.message.toLowerCase();
      let fileAppend = '';
      logger.debug(`Here is the filetype message${type}`);
      if (type === 'u' || type === 'user') {
        fileAppend = '.user';
      } else if (type === 'h' || type === 'hash') {
        fileAppend = '.hash';
      } else if (type === 's' || type === 'send') {
        // TODO fix this
        // sendFile.execute();
        command = '/broadcast';
        const obj = factory.execute(currentState, command, argument, parsedMessage.message, userEmail);
        if (obj.reply) {
          logger.debug('Object has a reply');
          const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, obj.reply);
        }
        currentState = obj.state;
      } else {
        const reply = 'Input not recognized please reply with (u)ser, (h)ash, or (s)end.';
        const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
        currentState = State.FILE_TYPE;
      }
      if (fileAppend) {
        logger.debug(`Here is file info${file}`);
        const cp = await fileHandler.copyFile(file.toString(), `${process.cwd()}/files/${filename.toString()}${fileAppend}`);
        logger.debug(`Here is cp:${cp}`);
        if (cp) {
          const reply = `File named: ${filename} successfully saved to directory.`;
          const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
        } else {
          const reply = `Error: File named: ${filename} not saved to directory.`;
          const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
        }
      }
    } else {
      // TODO parse argument better??
      let obj;
      if (parsedMessage.file) {
        obj = factory.file(parsedMessage.file, parsedMessage.filename);
        file = parsedMessage.file;
        filename = parsedMessage.filename;
      } else {
        // obj = factory.execute(currentState, command, argument, parsedMessage.message, userEmail);
        obj = factory.newExecute(messageService);
      }
      if (obj.reply) {
        logger.debug('Object has a reply');
        const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, obj.reply);
      }
      currentState = obj.state;
    }
  } catch (err) {
    logger.error(err);
    logger.error('Got an error');
  }
}

function affirmativeReply(message) {
  return message.toLowerCase() === 'yes' || message.toLowerCase() === 'y';
}

function negativeReply(message) {
  return message.toLowerCase() === 'no' || message.toLowerCase() === 'n';
}

function replyWithButtons(message) {
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

  const bMessage = WickrIOAPI.cmdSendNetworkMessage(broadcastMsgToSend, '', '', messageID, flags, buttons);
}

main();
