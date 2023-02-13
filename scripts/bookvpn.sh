#!/bin/bash

if ! [[ $# -ge 3 && $2 =~ ^[0-9]+$ ]] ; then
    echo -e "
SYNOPSIS
    sudo bash bookvpn.sh TARGET_DIR CHANNEL_COUNT CONFIG_ID...

DESCRIPTION
    bookvpn.sh connects with the server whose id is CONFIG_ID, collects at least
    CHANNEL_COUNT channels and stores the data inside the kukudy/TARGET_DIR/
    directory.
"
    exit 1
fi

cd "$(dirname "$0")/.." || exit 1

TARGET_DIR=$1
CHANNEL_COUNT=$2
shift
shift
CONFIG_IDS=( "$@" )

mkdir -p "${TARGET_DIR}" || exit 1
cd "${TARGET_DIR}" || exit 1

for CONFIG_ID in "${CONFIG_IDS[@]}"
do
    CONFIG_FILE="$CONFIG_ID".nordvpn.com.udp.ovpn
    [[ -f ../nordvpn/ovpn_udp/"$CONFIG_FILE" ]] || continue

    openvpn --config         "../nordvpn/ovpn_udp/${CONFIG_FILE}" \
            --auth-user-pass "../nordvpn/auth.txt"                \
            --writepid       "../nordvpn/pid.txt"                 \
            --log-append     "../nordvpn/log.txt"                 \
            --daemon
    bash ../scripts/sleepUntilConnected.sh || continue

    node ../updateStreams.js "${CHANNEL_COUNT}"
    node ../updateInfo.js

    kill "$(cat ../nordvpn/pid.txt)"
    bash ../scripts/sleepUntilDisconnected.sh
done
