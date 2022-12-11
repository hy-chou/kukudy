#!/bin/bash

if [ $# != 4 ] ; then
    echo -e "
SYNOPSIS
    bash book.sh PATH/TO/KUKUDY TARGET_DIR CHANNEL_COUNT ROUND_COUNT

DIRECTIONS
    Write the following lines to /etc/cron.d/kukudy

DIR_K=$(cd .. && pwd)

59 23 * * * $USER bash \${DIR_K}/scripts/book.sh \${DIR_K} playground 1000 3
"
    exit 1
fi

DIR_K=$1
TARGET_DIR=$2
CHANNEL_COUNT=$3
ROUND_COUNT=$4


mkdir -p ${DIR_K}/${TARGET_DIR}
cd ${DIR_K}/${TARGET_DIR}


for ROUND in $(seq ${ROUND_COUNT})
do
    node ../updateStreams.js ${CHANNEL_COUNT}
    node ../updateEdges.js
done

