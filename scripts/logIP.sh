#!/bin/bash

GUID_URL=https://nordvpn.com/wp-admin/admin-ajax.php?action=get_user_info_data

echo -en "$(date -uIns)\t$(curl -s ${GUID_URL})\n" >> ./log.txt
