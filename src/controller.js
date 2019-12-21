
const logger = require('./logger');
// conroller.js or?? initialize in the index.js???
const broadcastService = new BroadcastService(...);

const addAdmin = new AddAdmin(adminService);
const initializeBroadcast = new InitializeBroadcast(broadcastService)
const chooseFile = new ChooseFile(broadcastService)

const commands = [initializeBroadcast, chooseFile];



for(let i = 0; i < commands.length; i++) {
  if(commands[i].shouldExecute(state)) {
    commands[i].execute(message, ...);
  }
}

function controller() {



}
