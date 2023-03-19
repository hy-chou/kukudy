#!/bin/bash

if ! [[ $# -ge 3 && $2 =~ ^[0-9]+$ ]] ; then
    echo "bookvpnbycountry.sh: invalid input \"$*\"

SYNOPSIS
    sudo bash bookvpnbycountry.sh DIRECTORY CHANNEL_COUNT COUNTRY...

DESCRIPTION
    bookvpnbycountry.sh connects to the VPN server(s) in the COUNTRY(ies)
    consecutively, collects at least CHANNEL_COUNT channels and stores the data
    inside the DIRECTORY under the kukudy/ directory." >&2
    exit 1
fi

trap '__cleanup SIGINT'  SIGINT
trap '__cleanup SIGTERM' SIGTERM

__cleanup ()
{
    SIGNAL=$1

    echo -en "$(date -u +"%FT%T.%3NZ")\tgot ${SIGNAL}\n" >&2
    killall openvpn
    exit 1
}

init() {
    cd "$(dirname "$0")/.." || exit 1

    DIRECTORY=$1
    CHANNEL_COUNT=$2
    shift
    shift
    COUNTRIES=( "$@" )

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
    for COUNTRY in "${COUNTRIES[@]}" ; do
        echo -en "$(date -u +"%FT%T.%3NZ")\tcountry is ${COUNTRY}\n"
        CONFIG_FILE=$(node ../utils/getConfigIDByCountry.js "${COUNTRY}").udp.ovpn;
        [[ -f ../nordvpn/ovpn_udp/${CONFIG_FILE} ]] || continue
        echo -en "$(date -u +"%FT%T.%3NZ")\tconfig file is ${CONFIG_FILE}\n"

        echo -en "$(date -u +"%FT%T.%3NZ")\t${CONFIG_FILE} connecting\n"
        if [[ "$(connect)" -eq 0 ]] ; then
            echo -en "$(date -u +"%FT%T.%3NZ")\t${CONFIG_FILE} connected\n"

            updateStreams
            updateInfo
        else
            echo -en "$(date -u +"%FT%T.%3NZ")\t${CONFIG_FILE} not connected\n" >&2
        fi

        echo -en "$(date -u +"%FT%T.%3NZ")\t${CONFIG_FILE} disconnecting\n"
        if [[ "$(disconnect)" -eq 0 ]] ; then
            echo -en "$(date -u +"%FT%T.%3NZ")\t${CONFIG_FILE} disconnected\n"
        else
            echo -en "$(date -u +"%FT%T.%3NZ")\t${CONFIG_FILE} not disconnected\n" >&2
        fi

        sleep 25s
    done
    } >> log.out 2>> log.err
}

main "$@"
