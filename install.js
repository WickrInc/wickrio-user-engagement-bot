
const processes = require('./processes.json');


async function main(){
  if (process.argv.length < 2) {
    console.error("usage: node configure.js [client name] [integration]");
  }
  else {
    console.log("Here are the args", process.argv[3], process.argv[4])
  }
}
