#!/bin/bash

if ! [[ $# -eq 3 && $2 =~ ^[0-9]+$ && $3 =~ ^[0-9]+$ ]] ; then
    echo "book.sh: invalid input \"$*\"

SYNOPSIS
    bash book.sh TARGET_DIR CHANNEL_COUNT ROUND_COUNT

DESCRIPTION
    book.sh collects at least CHANNEL_COUNT channels for ROUND_COUNT rounds and
    stores the data inside the kukudy/TARGET_DIR/ directory." >&2
    exit 1
fi

cd "$(dirname "$0")/.." || exit 1

TARGET_DIR=$1
CHANNEL_COUNT=$2
ROUND_COUNT=$3

mkdir -p "${TARGET_DIR}" || exit 1
cd "${TARGET_DIR}" || exit 1

for _ in $(seq "${ROUND_COUNT}")
do
    node ../updateStreams.js "${CHANNEL_COUNT}"
    node ../updateInfo.js
done
