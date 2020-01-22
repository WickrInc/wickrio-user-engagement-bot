
const fs = require('fs');
const util = require('util');
const logger = require('../logger');

// const readdir = util.promisify(fs.readdir);

class FileHandler {

  listFiles (path) {
    return fs.readdirSync(path);
    // return readdir(path);
  }

  checkFile(path, file) {
    // TODO just pass this as a parameter??
    const filePath = `${path}/${file}`;
    // TODO fix this! use async await!
    const as = fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (err) {
        // TODO fix this!
        logger.error(`${file} ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}`);
        return false;
      }
      logger.debug(`${file} exists, and it is writable`);
      return true;
    });
  }

  findFile(path, fileName) {
    let found = false;
    const fileArr = [];
    fs.readdir(path, (err, files) => {
      if (err) {
        logger.error('Can not read from directory');
      } else {
        files.forEach((file) => {
          // logger.debug(file);
          fileArr.push(file.toString());
        });
      }
    });
    if (fileArr === undefined || fileArr.length == 0) {
      return false;
    }
    for (file of fileArr) {
      if (file === fileName) {
        found = true;
      }
    }
    return found;
  }

  //TODO correct this
  copyFile(originalPath, newPath) {
    fs.copyFile(originalPath, newPath, (err) => {
      if (err) {
        // throw err;
        logger.error(err);
        logger.error(err);
        return false;
      } else {
        logger.debug(`${originalPath} copied to ${newPath}`);
        return true;
      }
    });
  }
}

module.exports = FileHandler;

function main() {
  FileHandler.listFiles('./attachments');
  FileHandler.checkFile('./attachments', 'messages.txt');
  FileHandler.checkFile('./attachments', 'toren');
}

// main();
