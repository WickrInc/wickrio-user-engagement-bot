#!/bin/sh
npm install --unsafe-perm
node install.js $CLIENT_NAME $INTEGRATION
npm run build