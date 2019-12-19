'use strict';

const fs = require('fs');
//const {exec, execSync, execFileSync} = require('child_process');
const WickrIOAPI = require('wickrio_addon');
const WickrIOBotAPI = require('wickrio-bot-api');
const WickrUser = WickrIOBotAPI.WickrUser;
const bot = new WickrIOBotAPI.WickrIOBot();
const pkgjson = require('./package.json');
var writer = require('./src/helpers/message-writer.js');
var logger = require('./src/logger');
var whitelisted_users, job;

var fileHandler = require('./src/helpers/file_handler');
var broadcast = require('./src/commands/broadcast');
var factory = require('./src/factory');
var state = require('./src/state');
var currentState;
var help = require('./src/commands/help');

process.stdin.resume(); //so the program will not close instantly
if(!fs.existsSync(process.cwd() + "/attachments")) {
  fs.mkdirSync(process.cwd() + "/attachments");
}
if(!fs.existsSync(process.cwd() + "/files")) {
  fs.mkdirSync(process.cwd() + "/files");
}

async function exitHandler(options, err) {
  try {
    var closed = await bot.close();
    if (err || options.exit) {
      console.log("Exit reason:", err);
      process.exit();
    } else if (options.pid) {
      process.kill(process.pid);
    }
  } catch (err) {
    console.log(err);
  }
}

//catches ctrl+c and stop.sh events
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {pid: true}));
process.on('SIGUSR2', exitHandler.bind(null, {pid: true}));

//catches uncaught exceptions
//TODO make this more robust of a catch
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));

async function main() {
  console.log("Entering main!");
  try {
    var tokens = JSON.parse(process.env.tokens);
    var status = await bot.start(tokens.WICKRIO_BOT_NAME.value)
    if (!status) {
      exitHandler(null, {
        exit: true,
        reason: 'Client not able to start'
      });
    }

    if (tokens.WHITELISTED_USERS.encrypted) {
      whitelisted_users = WickrIOAPI.cmdDecryptString(tokens.WHITELISTED_USERS.value);
    } else {
      whitelisted_users = tokens.WHITELISTED_USERS.value;
    }
    whitelisted_users = whitelisted_users.split(',');

    // Make sure there are no white spaces on the whitelisted users
    for(var i = 0; i < whitelisted_users.length; i++){
      whitelisted_users[i] = whitelisted_users[i].trim();
    }

    bot.startListening(listen); //Passes a callback function that will receive incoming messages into the bot client
    //await bot.startListening(listen); //Passes a callback function that will receive incoming messages into the bot client
  } catch (err) {
    console.log(err);
  }
}

async function listen(message) {
  try {
    //TODO fix the parseMessage function so it can include control messages
    //TODO add a parseMessage that can get the important parts and leave out recipients
    var parsedMessage = bot.parseMessage(message); //Parses an incoming message and returns and object with command, argument, vGroupID and Sender fields
    if (!parsedMessage) {
      await writer.writeFile(message);
      return;
    }
    logger.debug('New incoming Message:', parsedMessage);
    var wickrUser;
    var fullMessage = parsedMessage.message;
    var command = parsedMessage.command;
    if (command != undefined) {
        command = command.toLowerCase().trim();
    } if (!command) {
      logger.debug("Command is empty!");
      writer.writeFile(message);
    }
    var argument = parsedMessage.argument;
    var userEmail = parsedMessage.userEmail;
    var vGroupID = parsedMessage.vgroupid;
    var convoType = parsedMessage.convotype;
    var personal_vGroupID = "";
    logger.debug("convoType=" + convoType);
    //Go back to dev toolkit and fix
    /*
    if(convoType === 'personal') {
      personal_vGroupID = vGroupID;
    } else {
      writer.writeFile(message);
      return;
    }
    */
 
    if (!verifyUser(userEmail)) {
      var reply = "Hey, this bot is just for announcements and can't respond to you personally. If you have a question, please get a hold of us a support@wickr.com or visit us a support.wickr.com. Thanks, Team Wickr";
      var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
      logger.debug(sMessage);
      return;
    }

    if (command === '/version') {
      var reply = "*Versions*\nIntegration: " + pkgjson.version +
                            "\nWickrIO Addon: " + pkgjson.dependencies["wickrio_addon"] +
                            "\nWickrIO API: " + pkgjson.dependencies["wickrio-bot-api"] ;
      var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
      return;
    }
    
    var user = bot.getUser(userEmail); //Look up user by their wickr email

    if (user === undefined) { //Check if a user exists in the database
      wickrUser = new WickrUser(userEmail, {
        index: 0,
        vGroupID: vGroupID,
        personal_vGroupID: personal_vGroupID,
        command: "",
        argument: "",
        confirm: "",
        type: ""
      });
      user = bot.addUser(wickrUser); //Add a new user to the database
    }
    logger.debug('user:', user)
   
    //TODO is this JSON.stringify necessary??
    //How to deal with duplicate files??
    if(parsedMessage.file) { //&& JSON.stringify(message) !== JSON.stringify(prevMessage)) {
      console.log('Here is file info' + parsedMessage.file);
      var cp = fileHandler.copyFile(parsedMessage.file.toString(), 'files/' + parsedMessage.filename.toString());
      if (cp) {
        var reply = "File named: " + parsedMessage.filename + " successfully saved to directory.";
        var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
      } else {
        var reply = "Error: File named: " + parsedMessage.filename + " not saved to directory.";
        var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
      }
      //var prevMessage = message;
    } else {
      //TODO parse argument better??
      var obj = factory.factory(currentState, command, argument, parsedMessage.message);
      console.log("Object reply", obj.reply);
      if (obj.reply) {
        console.log("Object has a reply");
        var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, obj.reply);
      }
      currentState = obj.state;
    }
  } catch (err) {
    console.error(err);
    console.log("Got an error");
  }
}

function readFileInput() {
  try {
    var rfs = fs.readFileSync('./processes.json', 'utf-8');
    if (!rfs) {
      console.log("Error reading processes.json!")
      return rfs;
    } else
      return rfs.trim().split('\n');
    }
  catch (err) {
    console.log(err);
    process.exit();
  }
}

function updateWhiteList()
{
    var processes;
    try {
        processes = fs.readFileSync('./processes.json', 'utf-8');
        if (!processes) {
          console.log("Error reading processes.json!")
          return;
        }
    }
    catch (err) {
        console.log(err);
        return;
    }

    var pjson = JSON.parse(processes);
    console.log(pjson);

    var wlUsers = whitelisted_users.join(',');
    if (pjson.apps[0].env.tokens.WHITELISTED_USERS.encrypted) {
        var wlUsersEncrypted = WickrIOAPI.cmdEncryptString(wlUsers);
        pjson.apps[0].env.tokens.WHITELISTED_USERS.value = wlUsersEncrypted;
    } else {
        pjson.apps[0].env.tokens.WHITELISTED_USERS.value = wlUsers;
    }

    console.log(pjson);

    try {
        var cp = execSync('cp processes.json processes_backup.json');
        var ps = fs.writeFileSync('./processes.json', JSON.stringify(pjson, null, 2));
    } catch (err) {
        console.log(err);
    }
}

function affirmativeReply(message){
  return message.toLowerCase() === 'yes' || message.toLowerCase() === 'y';
}

function negativeReply(message){
  return message.toLowerCase() === 'no' || message.toLowerCase() === 'n';
}

function replyWithButtons(message) {
  var button1 = {
    type : "message",
    text : "Yes",
    message : "yes"
  };
  var button2 = {
    type : "message",
    text : "No",
    message : "no"
  };
  var buttons = [button1, button2];

  var bMessage = WickrIOAPI.cmdSendNetworkMessage(broadcastMsgToSend, "", "", messageID, flags, buttons)
}

function verifyUser(user) {
  var found = whitelisted_users.indexOf(user);
  if (found === -1) {
    return false;
  } else {
    return true;
  }
}

function isInt(value) {
  return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}

main();

