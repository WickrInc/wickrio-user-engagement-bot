const state = require('../state');

class Version {
  static shouldExecute(command, state, message) {

  }

  static execute() {
    const reply = `*Versions*\nIntegration: ${pkgjson.version
    }\nWickrIO Addon: ${pkgjson.dependencies.wickrio_addon
    }\nWickrIO API: ${pkgjson.dependencies['wickrio-bot-api']}`;
    const obj = {
      reply,
      state: state.NONE,
    };
    return obj;
  }
}

module.exports = Version;
