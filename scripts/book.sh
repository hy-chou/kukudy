#!/bin/bash

if ! [[ $# -eq 2 && $2 =~ ^[0-9]+$ ]] ; then
    echo "book.sh: invalid arguments \"$*\"

SYNOPSIS
    bash book.sh TARGET_DIR CHANNEL_COUNT

DESCRIPTION
    book.sh collects at least CHANNEL_COUNT channels and stores the data inside
    the kukudy/TARGET_DIR/ directory." >&2
    exit 1
fi

cd "$(dirname "$0")/.." || exit 1

TARGET_DIR=$1
CHANNEL_COUNT=$2

mkdir -p "${TARGET_DIR}" || exit 1
cd "${TARGET_DIR}" || exit 1

{
echo -en "$(date -u +"%FT%TZ")\tuSuI starting\n"
node ../updateStreams.js "${CHANNEL_COUNT}"
node ../updateInfo.js
echo -en "$(date -u +"%FT%TZ")\tuSuI ended\n"
} >> log.out 2>> log.err
