#!/bin/bash

if [ $# -ne 3 ] ; then
    echo -e "
SYNOPSIS
    bash ./scripts/book.sh TARGET_DIR CHANNEL_COUNT ROUND_COUNT

NOTES
    book.sh can be scheduled to run at a specific time by creating a file in the
    /etc/cron.d directory with the following content:

SHELL=/bin/sh
PATH=$PATH
DIR_K=$PWD

49 15 04 02 * $USER bash \${DIR_K}/scripts/book.sh playground 100 1
"
    exit 1
fi

cd "$(dirname "$0")/.." || exit 1

TARGET_DIR=$1
CHANNEL_COUNT=$2
ROUND_COUNT=$3

mkdir "${TARGET_DIR}" || exit 1
cd "${TARGET_DIR}" || exit 1

bash ../scripts/logIP.sh

for _ in $(seq "${ROUND_COUNT}")
do
    node ../updateStreams.js "${CHANNEL_COUNT}"
    node ../updateEdges.js
done

bash ../scripts/logIP.sh
