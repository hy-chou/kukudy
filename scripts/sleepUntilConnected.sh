#!/bin/bash

GUID_URL="https://nordvpn.com/wp-admin/admin-ajax.php?action=get_user_info_data"

for R in $(seq 11)
do
    RES=$(curl -s "${GUID_URL}")
    if [[ ${RES} == *'"status":true'* ]]; then
        exit 0
    fi
    sleep "$R"
done
exit 1
