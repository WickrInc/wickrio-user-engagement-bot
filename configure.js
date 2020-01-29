const fs = require('fs');
const prompt = require('prompt');
const processes = require('./processes.json');
const dataStringify = JSON.stringify(processes);
const dataParsed = JSON.parse(dataStringify);
const {exec, execSync, execFileSync} = require('child_process');
//Add any tokens(as strings separated by commas) you want to prompt for in the configuration process here
const tokens = ['WICKRIO_BOT_NAME', 'DATABASE_ENCRYPTION_KEY', 'WHITELISTED_USERS'];

prompt.colors = false;

process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, err) {
  try {
    if (err) {
      process.kill(process.pid);
      process.exit();
    }
    if (options.exit) {
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

//catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {pid: true}));
process.on('SIGUSR2', exitHandler.bind(null, {pid: true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
  exit: true,
  reason: 'uncaughtException'
}));

main();

async function main() {
  if (processConfigured()) {
    try {
      var cp = execSync('cp processes.json processes_backup.json');
      if (dataParsed.apps[0].env.tokens.WICKRIO_BOT_NAME.value !== undefined) {
        var newName = "WickrIO-User-Engagement-Bot_" + dataParsed.apps[0].env.tokens.WICKRIO_BOT_NAME.value;
      } else {
        var newName = "WickrIO-User-Engagement-Bot";
      }
      //var assign = Object.assign(dataParsed.apps[0].name, newName);
      dataParsed.apps[0].name = newName;
      var ps = fs.writeFileSync('./processes.json', JSON.stringify(dataParsed, null, 2));
    } catch (err) {
      console.log(err);
    }
    console.log("Already configured");
    process.exit();
  } else {
    try {
      var it = await inputTokens();
      process.exit();
    } catch (err) {
      console.log(err);
    }
  }
}

async function inputTokens() {
  var config = [];
  var i = 0;

  newObjectResult = getCurrentValues();

  return new Promise((resolve, reject) => {
    var recursivePrompt = function() {
      var token = tokens[i];
      var type;
      if (i === tokens.length) {
        return resolve("Configuration complete!");
      }
      //If added another config value name to the tokens array in line 52,
      //you would need to add another if statement block below with the respectful config value name
      if (token === 'WICKRIO_BOT_NAME' && process.env.WICKRIO_BOT_NAME !== undefined) {
        var input = token + '=' + process.env.WICKRIO_BOT_NAME;
        config.push(input);
        i++;
        return recursivePrompt();
      } else if (token === 'DATABASE_ENCRYPTION_KEY' && process.env.DATABASE_ENCRYPTION_KEY !== undefined) {
        var input = token + '=' + process.env.DATABASE_ENCRYPTION_KEY;
        config.push(input);
        i++;
        return recursivePrompt();
      } else if (token === 'WHITELISTED_USERS' && process.env.WHITELISTED_USERS !== undefined) {
        var input = token + '=' + process.env.WHITELISTED_USERS;
        config.push(input);
        i++;
        return recursivePrompt();
      }
      var dflt = newObjectResult[token];
      var emptyChoice = false;
      if (dflt === "undefined" || dflt === undefined) {
        dflt = "N/A";
        emptyChoice = true;
      }
      var schema = {
        properties: {
          [token]: {
            pattern: type,
            type: 'string',
            description: 'Enter your ' + token.replace(/_/g, " ").replace(/\w\S*/g, function(txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }) + ' (Default: ' + dflt + ')',
            message: 'Cannot leave ' + token + ' empty! Please enter a value',
            required: emptyChoice
          }
        }
      };
      prompt.get(schema, function(err, answer) {
        if (answer[token] === "")
          answer[token] = newObjectResult[token];
        var input = token + '=' + answer[token];
        config.push(input);
        i++;
        recursivePrompt();
      });
    }
    recursivePrompt();
  }).then(function(answer) {
    let objectKeyArray = [];
    let objectValueArray = [];
    for (var i = 0; i < config.length; i++) {
      let locationEqual = config[i].indexOf("=");
      let objectKey = config[i].slice(0, locationEqual);
      let objectValue = config[i].slice(locationEqual + 1, config[i].length); //Input value
      objectKeyArray.push(objectKey);
      objectValueArray.push(objectValue);
    }
    var newObjectResult = {};
    for (var j = 0; j < config.length; j++) {
      newObjectResult[objectKeyArray[j]] = objectValueArray[j];
    }
    for (var key in newObjectResult) {
      //If added another config value name to the tokens array in line 52,
      //you would need to add another if statement block below with the respectful config value name
      if (key === 'WICKRIO_BOT_NAME' && process.env.WICKRIO_BOT_NAME !== undefined) {
        var obj = {
          "value": process.env.WICKRIO_BOT_NAME,
          "encrypted": false
        };
        newObjectResult.WICKRIO_BOT_NAME = obj;
        continue;
      } else if (key === 'DATABASE_ENCRYPTION_KEY' && process.env.DATABASE_ENCRYPTION_KEY !== undefined) {
        var obj = {
          "value": process.env.DATABASE_ENCRYPTION_KEY,
          "encrypted": false
        };
        newObjectResult.DATABASE_ENCRYPTION_KEY = obj;
        continue;
      } else if (key === 'WHITELISTED_USERS' && process.env.WHITELISTED_USERS !== undefined) {
        var obj = {
          "value": process.env.WHITELISTED_USERS,
          "encrypted": false
        };
        newObjectResult.WHITELISTED_USERS = obj;
        continue;
      }
      var obj = {
        "value": newObjectResult[key],
        "encrypted": false
      };
      newObjectResult[key] = obj;
    }
    for (var key in dataParsed.apps[0].env.tokens) {
      delete dataParsed.apps[0].env.tokens[key];
    }
    try {
      var cp = execSync('cp processes.json processes_backup.json');
      if (process.env.WICKRIO_BOT_NAME !== undefined) {
        var newName = "WickrIO-User-Engagement-Bot_" + process.env.WICKRIO_BOT_NAME;
      } else if (newObjectResult.WICKRIO_BOT_NAME !== undefined) {
        var newName = "WickrIO-User-Engagement-Bot_" + newObjectResult.WICKRIO_BOT_NAME.value;
      } else {
        var newName = "WickrIO-User-Engagement-Bot";
      }

      //var assign = Object.assign(dataParsed.apps[0].name, newName);
      dataParsed.apps[0].name = newName;

      var assign = Object.assign(dataParsed.apps[0].env.tokens, newObjectResult);
      var ps = fs.writeFileSync('./processes.json', JSON.stringify(dataParsed, null, 2));
    } catch (err) {
      console.log(err);
    }
    console.log(answer);
    return;
  }).catch(err => {
    console.log(err);
  });
}

function getCurrentValues()
{
    var newObjectResult = {};
    var processes;
    try {
        processes = fs.readFileSync('./processes.json', 'utf-8');
        if (!processes) {
          console.log("Error reading processes.json!")
          return newObjectResult;
        }
    }
    catch (err) {
        console.log(err);
        return newObjectResult;
    }

    var pjson = JSON.parse(processes);
    if (pjson.apps[0].env.tokens === undefined) {
        return newObjectResult;
    }

    if (pjson.apps[0].env.tokens.WICKRIO_BOT_NAME !== undefined) {
      newObjectResult['WICKRIO_BOT_NAME'] = pjson.apps[0].env.tokens.WICKRIO_BOT_NAME.value;
    }
    if (pjson.apps[0].env.tokens.DATABASE_ENCRYPTION_KEY !== undefined) {
      newObjectResult['DATABASE_ENCRYPTION_KEY'] = pjson.apps[0].env.tokens.DATABASE_ENCRYPTION_KEY.value;
    }
    if (pjson.apps[0].env.tokens.WHITELISTED_USERS !== undefined) {
      newObjectResult['WHITELISTED_USERS'] = pjson.apps[0].env.tokens.WHITELISTED_USERS.value;
    }

    return newObjectResult;
}

function processConfigured()
{
    var processes;
    try {
        processes = fs.readFileSync('./processes.json', 'utf-8');
        if (!processes) {
          console.log("Error reading processes.json!")
          return false;
        }
    }
    catch (err) {
        console.log(err);
        return false;
    }

    var pjson = JSON.parse(processes);
    if (pjson.apps[0].env.tokens === undefined) {
        return false;
    }

    if (pjson.apps[0].env.tokens.WICKRIO_BOT_NAME === undefined) {
        return false;
    }
    if (pjson.apps[0].env.tokens.WHITELISTED_USERS === undefined) {
        return false;
    }
    return true;
}
