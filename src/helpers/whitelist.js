'use strict'

const WickrIOAPI = require('wickrio_addon');
const fs = require('fs');
const {exec, execSync, execFileSync} = require('child_process');

class WhitelistRepository {
  constructor(fs){
  }

  getWhitelist () {
    var tokens = JSON.parse(process.env.tokens);
    let whitelisted_users;

    if (tokens.WHITELISTED_USERS.encrypted) {
      whitelisted_users = WickrIOAPI.cmdDecryptString(tokens.WHITELISTED_USERS.value);
    } else {
      whitelisted_users = tokens.WHITELISTED_USERS.value;
    }
    whitelisted_users = whitelisted_users.split(',');

    // Make sure there are no white spaces on the whitelisted users
    for(var i = 0; i < whitelisted_users.length; i++) {
      whitelisted_users[i] = whitelisted_users[i].trim();
    }
    return whitelisted_users;
  }

  updateWhitelist (wlUsers) {
    var processes;
    try {
      processes = fs.readFileSync('./processes.json', 'utf-8');
      if (!processes) {
        console.log("Error reading processes.json!")
        return;
      }
    } catch (err) {
      console.log(err);
      return;
    }

    var pjson = JSON.parse(processes);
    console.log(pjson);

    //var wlUsers = getWhitelistedUsers().join(','); // whitelisted_users.join(',');
    var usersString = wlUsers.join(',');

    if (pjson.apps[0].env.tokens.WHITELISTED_USERS.encrypted) {
      var wlUsersEncrypted = WickrIOAPI.cmdEncryptString(usersString);
      pjson.apps[0].env.tokens.WHITELISTED_USERS.value = wlUsersEncrypted;
    } else {
      pjson.apps[0].env.tokens.WHITELISTED_USERS.value = usersString;
    }

    console.log("pjson", pjson);

    try {
      let cp = execSync('cp processes.json processes_backup.json');
      let ps = fs.writeFileSync('./processes.json', JSON.stringify(pjson, null, 2));
    } catch (err) {
      console.log(err);
    }
  }

}

module.exports = WhitelistRepository;
