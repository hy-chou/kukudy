#!/bin/bash

GUID_URL="https://nordvpn.com/wp-admin/admin-ajax.php?action=get_user_info_data"

curl -s "${GUID_URL}"
