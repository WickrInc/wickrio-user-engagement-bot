// import WickrIOAPI from 'wickrio_addon'
// const whitelist from '../helpers/whitelist.js');
import state from '../state'
import logger from '../logger'

// let whitelist;

class Admin {
  constructor(whitelistRepository) {
    this.whitelist = whitelistRepository
  }

  list() {
    logger.debug('admin list')
    const whitelistedUsers = this.whitelist.getWhitelist()
    logger.debug(`wl_users${whitelistedUsers}`)
    const userList = whitelistedUsers.join('\n')
    logger.debug(`userList${userList}`)
    const reply = `Current admins:\n${userList}`

    const listObj = {
      reply,
      state: state.NONE,
    }
    return listObj
  }

  add(userEmail, users) {
    let reply
    const whitelistedUsers = this.whitelist.getWhitelist()
    const addFails = []
    if (users === undefined || users.length === 0) {
      reply = 'Command contains no user names to add!'
    } else {
      for (let i = 0; i < users.length; i++) {
        if (whitelistedUsers.includes(users[i])) {
          addFails.push(users.splice(i, 1))
          i--
        }
      }
      if (addFails.length >= 1) {
        reply =
          'Failed to add some users current list of admins already contains\n'
        reply += addFails.join('\n')
        // var uMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);
      }

      if (users.length >= 1) {
        // Send the initial response
        // reply = 'Going to add admins:\n' + users.join('\n');
        // var uMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);

        for (let i = 0; i < users.length; i++) {
          whitelistedUsers.push(users[i])
        }
        console.log('whitelistedUsers', whitelistedUsers)
        this.whitelist.updateWhitelist(
          whitelistedUsers
        ) // Send a message to all the current white listed users
        `${userEmail} has added the following admins:\n${users.join('\n')}`
      }
    }
    const addObj = {
      reply,
      state: state.NONE,
    }
    return addObj
  }

  remove(userEmail, users) {
    const removeFails = []
    const whitelistedUsers = this.whitelist.getWhitelist()
    let reply
    if (users === undefined || users.length === 0) {
      reply = 'Command contains no user names to remove'
    } else {
      for (let i = 0; i < users.length; i++) {
        if (!whitelistedUsers.includes(users[i])) {
          removeFails.push(users.splice(i, 1))
          i--
        }
      }
      if (removeFails.length >= 1) {
        reply =
          'Failed to remove some users current list of admins does not contain\n'
        reply += removeFails.join('\n')
        // const umessage = WickrIOAPI.cmdsendroommessage(vgroupid, reply);
      }

      if (users.length >= 1) {
        // reply = 'Going to remove admins:\n' + users.join('\n');
        // var uMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);

        for (let i = 0; i < users.length; i++) {
          whitelistedUsers.splice(whitelistedUsers.indexOf(users[i]), 1)
        }

        this.whitelist.updateWhitelist(
          whitelistedUsers
        )`${userEmail} has removed the following admins:\n${users.join('\n')}`
      }
    }
    const removeObj = {
      reply,
      state: state.NONE,
    }
    return removeObj
  }
}

module.exports = Admin
