#!/bin/sh
if [ -f "/usr/local/nvm/nvm.sh" ]; then
  . /usr/local/nvm/nvm.sh
  nvm use 16
fi

npm install --unsafe-perm
node install.js $CLIENT_NAME $INTEGRATION
