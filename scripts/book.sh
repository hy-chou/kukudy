#!/bin/bash

if ! [[ $# -eq 2 && $2 =~ ^[0-9]+$ ]] ; then
    echo "book.sh: invalid arguments \"$*\"

SYNOPSIS
    bash book.sh DIRECTORY CHANNEL_COUNT

DESCRIPTION
    book.sh collects at least CHANNEL_COUNT channels and stores the data inside
    the DIRECTORY under the kukudy/ directory." >&2
    exit 1
fi

cd "$(dirname "$0")/.." || exit 1

DIRECTORY=$1
CHANNEL_COUNT=$2

mkdir -p "${DIRECTORY}" || exit 1
cd "${DIRECTORY}" || exit 1

{
TS_NOW=$(date +"%s")
TS_LAST_US=$(stat --format="%Y" ./ulgs 2> /dev/null || echo 0)

if [[ $(( TS_NOW - TS_LAST_US )) -ge $(( 10 * 60 )) ]] ; then
    echo -en "$(date -u +"%FT%T.%3NZ")\tuS starting\n"
    node ../updateStreams.js "${CHANNEL_COUNT}"
    echo -en "$(date -u +"%FT%T.%3NZ")\tuS ended\n"
fi

echo -en "$(date -u +"%FT%T.%3NZ")\tuI starting\n"
node ../updateInfo.js
echo -en "$(date -u +"%FT%T.%3NZ")\tuI ended\n"
} >> log.out 2>> log.err
