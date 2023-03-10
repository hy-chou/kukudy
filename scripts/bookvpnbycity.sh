#!/bin/bash

if ! [[ $# -ge 3 && $2 =~ ^[0-9]+$ ]] ; then
    echo "bookvpnbycity.sh: invalid input \"$*\"

SYNOPSIS
    sudo bash bookvpnbycity.sh DIRECTORY CHANNEL_COUNT CITY...

DESCRIPTION
    bookvpnbycity.sh connects to the VPN server(s) in the CITY(ies)
    consecutively, collects at least CHANNEL_COUNT channels and stores the data
    inside the DIRECTORY under the kukudy/ directory." >&2
    exit 1
fi

init() {
    cd "$(dirname "$0")/.." || exit 1

    DIRECTORY=$1
    CHANNEL_COUNT=$2
    shift
    shift
    CITIES=( "$@" )

    mkdir -p "${DIRECTORY}" || exit 1
    cd "${DIRECTORY}" || exit 1
}

connect() {
    openvpn --config         "../nordvpn/ovpn_udp/${CONFIG_FILE}" \
            --auth-user-pass "../nordvpn/auth.txt"                \
            --writepid       "../nordvpn/pid.txt"                 \
            --log-append     "../nordvpn/log.txt"                 \
            --daemon &&
    bash ../scripts/sleepUntilConnected.sh
    echo "$?"
}

updateStreams() {
    TS_NOW=$(date +"%s")
    TS_LAST_US=$(stat --format="%Y" ./ulgs 2> /dev/null || echo 0)

    if [[ $(( TS_NOW - TS_LAST_US )) -ge $(( 10 * 60 )) ]] ; then
        echo -en "$(date -u +"%FT%T.%3NZ")\tuS starting\n"
        node ../updateStreams.js "${CHANNEL_COUNT}"
        echo -en "$(date -u +"%FT%T.%3NZ")\tuS ended\n"
    fi
}

updateInfo() {
    echo -en "$(date -u +"%FT%T.%3NZ")\tuI starting\n"
    node ../updateInfo.js
    echo -en "$(date -u +"%FT%T.%3NZ")\tuI ended\n"
}

disconnect() {
    killall openvpn
    bash ../scripts/sleepUntilDisconnected.sh
    echo "$?"
}

main() {
    init "$@"
    {
    for CITY in "${CITIES[@]}" ; do
        echo -en "$(date -u +"%FT%T.%3NZ")\tcity is ${CITY}\n"
        CONFIG_FILE=$(node ../utils/getConfigIDByCity.js "${CITY}").udp.ovpn;
        [[ -f ../nordvpn/ovpn_udp/${CONFIG_FILE} ]] || continue
        echo -en "$(date -u +"%FT%T.%3NZ")\tconfig file is ${CONFIG_FILE}\n"

        echo -en "$(date -u +"%FT%T.%3NZ")\t${CONFIG_FILE} connecting\n"
        if [[ "$(connect)" -eq 0 ]] ; then
            echo -en "$(date -u +"%FT%T.%3NZ")\t${CONFIG_FILE} connected\n"

            updateStreams
            updateInfo

            if [[ "$(disconnect)" -eq 0 ]] ; then
                echo -en "$(date -u +"%FT%T.%3NZ")\t${CONFIG_FILE} disconnected\n"
            else
                echo -en "$(date -u +"%FT%T.%3NZ")\t${CONFIG_FILE} not disconnected\n" >&2
            fi
        else
            echo -en "$(date -u +"%FT%T.%3NZ")\t${CONFIG_FILE} not connected\n" >&2
        fi
        sleep 25s
    done
    } >> log.out 2>> log.err
}

main "$@"
