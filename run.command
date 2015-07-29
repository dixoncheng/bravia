#!/bin/sh
cd `dirname $0`
#node command-"$1".js
node ./command-power.js

osascript -e 'tell application "Terminal" to quit' &
exit