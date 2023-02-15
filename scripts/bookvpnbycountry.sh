#!/bin/bash

if ! [[ $# -ge 3 && $2 =~ ^[0-9]+$ ]] ; then
    echo "bookvpnbycountry.sh: invalid input \"$*\"

SYNOPSIS
    sudo bash bookvpnbycountry.sh TARGET_DIR CHANNEL_COUNT COUNTRY...

DESCRIPTION
    bookvpnbycountry.sh connects with the server in COUNTRY, collects at least
    CHANNEL_COUNT channels and stores the data inside the kukudy/TARGET_DIR/
    directory." >&2
    exit 1
fi

cd "$(dirname "$0")/.." || exit 1

TARGET_DIR=$1
CHANNEL_COUNT=$2
shift
shift
COUNTRIES=( "$@" )

mkdir -p "${TARGET_DIR}" || exit 1
cd "${TARGET_DIR}" || exit 1

for COUNTRY in "${COUNTRIES[@]}"
do
    CONFIG_FILE=$(node ../utils/getConfigIDByCountry.js "$COUNTRY").udp.ovpn;

    [[ -f ../nordvpn/ovpn_udp/${CONFIG_FILE} ]] || continue

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
