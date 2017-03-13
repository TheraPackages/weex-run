#===============================================
# Copyright (C) 2017 All rights reserved.
#=============================================== 
# Filename:   Find Unuse Port.sh
# Author:     miaoyou.gmy
# Date:       2017-03-03
# Description:
# TCP 端口号是16位无符号整数，最大为 65535
# 该脚本指在 寻找（7000 - 65535）号段中未被使用的端口号
# 
# Modification: 
# V1. (7000 - 65535) 号段寻找未被使用的最小端口号
#===============================================
#!/bin/bash



endPortNumber=65535
starPortNumber=7000

for i in `seq $starPortNumber $endPortNumber`
do
    `lsof -i:$i`
    if [ `echo $?` -eq 1 ]
    then
        echo $i
        exit 0
    fi
done

exit 1
