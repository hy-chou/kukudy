#!/bin/bash

if [ $# != 4 ] ; then
    echo -e "
SYNOPSIS
    bash book.sh PATH/TO/KUKUDY PATH/TO/TARGET_DIR CHANNEL_COUNT ROUND_COUNT

DIRECTIONS
    Write the following lines to /etc/cron.d/kukudy

DIR_K=$(cd .. && pwd)

31 17 09 12 * $USER bash \${DIR_K}/scripts/book.sh \${DIR_K} \${DIR_K}/pg 100 3
"
    exit 1
fi

DIR_K=$1
TARGET_DIR=$2
CHANNEL_COUNT=$3
ROUND_COUNT=$4


mkdir -p ${TARGET_DIR}/logs
cd ${TARGET_DIR}

echo -en "$(date -uIns)\t$CCODE\n" >> ${TARGET_DIR}/logs/checkpoint.txt

for ROUND in $(seq ${ROUND_COUNT})
do
    /usr/bin/node ../updateStreams.js ${CHANNEL_COUNT}
    echo -en "$(date -uIns)\t${SERVER_ID} uS ${ROUND} done\n" >> ${TARGET_DIR}/logs/checkpoint.txt
    /usr/bin/node ../updateEdges.js
    echo -en "$(date -uIns)\t${SERVER_ID} uE ${ROUND} done\n" >> ${TARGET_DIR}/logs/checkpoint.txt
done

echo -en "$(date -uIns)\t#DONE\n" >> ${TARGET_DIR}/logs/checkpoint.txt

exit 0
