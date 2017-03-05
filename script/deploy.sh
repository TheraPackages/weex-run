#===============================================
# Copyright (C) 2016 All rights reserved.
#===============================================
# Filename:   Deploy Preview on iOS Simulator.sh
# Author:     miaoyou.gmy
# Date:       2016-10-28
# Description:
#
# Modification:
#
#===============================================
#!/bin/bash

# for example: 8AF33724-D395-47DD-923E-D1BC1CCBE7D3 ~/Preview.app 7001

udid=$1
packagePath=$2
port=$3
readonly appid="com.taobao.Preview"

if [ ! $udid ] || [ ! $packagePath ] ;then
    echo "please input udid and path"
    exit 1
fi
# step. 1
# if the udid Simulator is booted， so don't kill and relaunch. just install app
IFS=' ' read -r -a array <<< `xcrun simctl list | grep $udid`
LAST=${array[@]: -1}
if [ "$LAST" != "(Booted)" ]; then
	#shot down other Simulator
    killall -9 iOS Simulator
    open -n /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app --args -CurrentDeviceUDID $udid
else
    echo $udid Booted!
fi

#step. 2 wait when Simulator is ready and install app
while true
do
	xcrun simctl install booted $packagePath 2>/dev/null
	if [ $? == 0 ]
	then
		#step. 3 launch app
		xcrun simctl launch booted $appid -DumplingsPort $port
		exit 0
	fi
	sleep 1
done
