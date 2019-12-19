
const WickrIOAPI = require('wickrio_addon');
//const whitelist = require('../helpers/whitelist.js');
const state = require('../state');

class Admin {
  constructor(whitelistRepository) {
    this.whitelist = whitelistRepository;
  }

  list () {
    const whitelisted_users = this.whitelist.getWhitelist();
    const userList = whitelisted_users.join('\n');
    const reply = `Current admins:\n${userList}`;

    const listObj = {
      reply,
      state: state.NONE,
    };
    return listObj;
  }

  add (userEmail, users) {
    let reply;
    const whitelisted_users = this.whitelist.getWhitelist();
    const addFails = [];
    if (users === undefined || users.length == 0) {
      reply = 'Command contains no user names to add!';
    } else {
      for (let i = 0; i < users.length; i++) {
        if (whitelisted_users.includes(users[i])) {
          addFails.push(users.splice(i, 1));
          i--;
        }
      }
      if (addFails.length >= 1) {
        reply = 'Failed to add some users current list of admins already contains\n';
        reply += addFails.join('\n');
        // var uMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
      }

      if (users.length >= 1) {
        // Send the initial response
        // reply = 'Going to add admins:\n' + users.join('\n');
        // var uMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);

        for (let i = 0; i < users.length; i++) {
          whitelisted_users.push(users[i]);
        }
        console.log('whitelisted_users', whitelisted_users);
        this.whitelist.updateWhitelist(whitelisted_users);
        // Send a message to all the current white listed users
        const doneReply = `${userEmail} has added the following admins:\n${users.join('\n')}`;
        const uMessage = WickrIOAPI.cmdSend1to1Message(whitelisted_users, doneReply);
      }
    }
    const addObj = {
      reply,
      state: state.NONE,
    };
    return addObj;
  }

  remove (userEmail, users) {
    const removeFails = [];
    const whitelisted_users = this.whitelist.getWhitelist();
    let reply;
    if (users === undefined || users.length == 0) {
      reply = 'Command contains no user names to remove';
    } else {
      for (let i = 0; i < users.length; i++) {
        if (!whitelisted_users.includes(users[i])) {
          removeFails.push(users.splice(i, 1));
          i--;
        }
      }
      if (removeFails.length >= 1) {
        reply = 'Failed to remove some users current list of admins does not contain\n';
        reply += removeFails.join('\n');
        // var umessage = wickrioapi.cmdsendroommessage(vgroupid, reply);
      }

      if (users.length >= 1) {
        // reply = 'Going to remove admins:\n' + users.join('\n');
        // var uMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);

        for (let i = 0; i < users.length; i++) {
          whitelisted_users.splice(whitelisted_users.indexOf(users[i]), 1);
        }

        this.whitelist.updateWhitelist(whitelisted_users);
        const doneReply = `${userEmail} has removed the following admins:\n${users.join('\n')}`;
        const uMessage = WickrIOAPI.cmdSend1to1Message(whitelisted_users, doneReply);
      }
    }
    const removeObj = {
      reply,
      state: state.NONE,
    };
    return removeObj;
  }
}

module.exports = Admin;
