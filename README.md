# kukudy

## Prerequisites

- Node.js 18
- `openvpn`

## Installation

1. `git clone https://github.com/hy-chou/kukudy.git`
2. `cd kukudy/`
3. `npm install`

## The .env file

Kukudy uses Twitch API to interact with Twitch. Create a `.env` file inside the `kukudy/` directory with the following content:

```.env
CLIENT_ID="q5tfahmk1wwd5f7hi1jef3fmd3s0f4"
CLIENT_SECRET="ctylihpd07ik133uxeue644y3hcrpc"
ACCESS_TOKEN="fe4lgy6mtrah3s45vaesmh0thc0egx"

CLIENT_ID_GQL="kimne78kx3ncx6brgo4mv6wki5h1ko"
```

The lines above are example credentials, except for the last line. So, let's get your own credentials.

### Client ID and Client Secret

Sign up for a Twitch account, log in and go to [Twitch Developers' Console](https://dev.twitch.tv/console). Click on _Register Your Application_ in the _Application_ section, fill out the form and click _Create_. You should see your application in the _Application_ section. Click on _Manage_ and you should see your Client ID and Client Secret.

Replace the Client ID and Client Secret in the `.env` file with yours.

### Access Token

As specified in [Twitch Developers' Document](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow), to get an access token, run the following command.

```bash
curl -X POST 'https://id.twitch.tv/oauth2/token' \
     -F 'grant_type=client_credentials' \
     -F 'client_id=<CLIENT_ID goes here>' \
     -F 'client_secret=<CLIENT_SECRET goes here>'
```

The reply is in the json format.

```json
{
  "access_token": "0vbuo8rvancxeuvon7k975jf66b5sq",
  "expires_in": 4533330,
  "token_type": "bearer"
}
```

Replace the Access Token in `.env` file with yours.

Note that an access token expires in about two months, and if you do not get a new one, every request to Twitch API would return an HTTP error code 401. We recommend getting a new one every month. Check out the [Cron guide](#Cron-guide) for a possible solution.

## Introductory Tutorials

These tutorials, designed for first-time kukudy users, provides descriptions of the fundamental scripts inside `kukudy/`.

Before we start, go to the `kukudy/` directory and do the following steps:

1. `mkdir playground`
2. `cd playground`

Let's go!

### 1. updateStreams.js

```bash
node ../updateStreams.js [NUMBER_OF_CHANNELS]
```

> `NUMBER_OF_CHANNELS` is 100 by default.

The `updateStreams.js` script uses Twitch API's [Get Streams](https://dev.twitch.tv/docs/api/reference/#get-streams) to get a list of active streams, which is in descending order by the number of viewers watching the stream.

<details><summary>data format</summary><p>

The data is stored in two formats inside two directories, `ulgs/` and `dump/getStreams/`.

#### ULGS/

Inside `ulgs/` are `.txt` files.

Each filename is the time `updateStreams.js` starts running in UTC.

Each line is a user login, namely the name of a channel.

#### DUMPS/REQSTREAMS/

Inside `dumps/reqStreams/` are `.tsv` files.

Each filename is the time `updateStreams.js` starts running in UTC.

Each line has five tab-separated elements:

1. timestamp - sent time
2. timestamp - received time
3. cursor
4. HTTP headers (json) - all value are strings
   ```json
   {
     "connection": "",
     "content-type": "",
     "access-control-allow-origin": "",
     "ratelimit-limit": "",
     "ratelimit-remaining": "",
     "ratelimit-reset": "",
     "timing-allow-origin": "",
     "date": "",
     "x-served-by": "",
     "x-cache": "",
     "x-cache-hits": "",
     "x-timer": "",
     "vary": "",
     "strict-transport-security": "",
     "transfer-encoding": ""
   }
   ```
5. HTTP body (json) - Get Streams API [reference](https://dev.twitch.tv/docs/api/reference/#get-streams)

</p></details>

### 2. updateInfo.js

```bash
node ../updateInfo.js
```

The `updateInfo.js` script reads the latest stream list inside `ulgs/` to get information of the edge servers distributing the streams in the list.

<details><summary>data format</summary><p>

The data is stored in two formats inside three directories, `info/`, `dumps/reqPlaybackAccessToken/` and `dumps/reqUsherM3U8/`.

#### INFO/

Inside `info/` are `.tsv` files.

Each filename is the time `updateInfo.js` starts running in UTC.

Each line has three tab-separated elements:

1. timestamp
2. user login
3. info (json) - all value are strings
   ```json
   {
     "NODE": "video-edge-{six hexes}.{IATA airport code}{two digits}",
     "MANIFEST-NODE-TYPE": "weaver_cluster",
     "MANIFEST-NODE": "video-weaver.{IATA airport code}{two digits}",
     "SUPPRESS": "",
     "SERVER-TIME": "",
     "TRANSCODESTACK": "",
     "USER-IP": "{IPv4}",
     "SERVING-ID": "",
     "CLUSTER": "{IATA airport code}{two digits}",
     "ABS": "",
     "VIDEO-SESSION-ID": "",
     "BROADCAST-ID": "",
     "STREAM-TIME": "",
     "B": "",
     "USER-COUNTRY": "{ISO 3166-1 alpha-2 code}",
     "MANIFEST-CLUSTER": "{IATA airport code}{two digits}",
     "ORIGIN": "{IATA airport code}{two digits}",
     "C": "",
     "D": ""
   }
   ```

#### DUMPS/REQPLAYBACKACCESSTOKEN/

Inside the `dumps/reqPlaybackAccessToken/` directory are `.tsv` files.

Each filename is the UTC time shortly after `updateInfo.js` starts running.

Each line has five tab-separated elements:

1. timestamp - sent time
2. timestamp - received time
3. user login
4. HTTP headers (json) - all value are strings
   ```json
   {
     "connection": "",
     "content-length": "",
     "content-type": "",
     "access-control-allow-origin": "",
     "date": ""
   }
   ```
5. HTTP body (json)
   ```json
   {
     "data": {
       "streamPlaybackAccessToken": {
         "value": "",
         "signature": "",
         "__typename": ""
       }
     },
     "extensions": {
       "durationMilliseconds": "",
       "operationName": "",
       "requestID": ""
     }
   }
   ```
   The `data.streamPlaybackAccessToken.value` object is a JSON string.
   ```json
   {
     "adblock": false,
     "authorization": {
       "forbidden": false,
       "reason": ""
     },
     "blackout_enabled": false,
     "channel": "",
     "channel_id": 999999999,
     "chansub": {
       "restricted_bitrates": [],
       "view_until": 9999999999
     },
     "ci_gb": false,
     "geoblock_reason": "",
     "device_id": null,
     "expires": 9999999999,
     "extended_history_allowed": false,
     "game": "",
     "hide_ads": false,
     "https_required": true,
     "mature": false,
     "partner": false,
     "platform": "web",
     "player_type": "site",
     "private": {
       "allowed_to_view": true
     },
     "privileged": false,
     "role": "",
     "server_ads": true,
     "show_ads": true,
     "subscriber": false,
     "turbo": false,
     "user_id": null,
     "user_ip": "{IPv4}",
     "version": 2
   }
   ```

#### DUMPS/REQUSHERM3U8/

Inside the `dumps/reqUsherM3U8/` directory are `.tsv` files.

Each filename is the UTC time shortly after `updateInfo.js` starts running.

Each line has five tab-separated elements:

1. timestamp - sent time
2. timestamp - received time
3. user login
4. HTTP headers (json) - all value are strings
   ```json
   {
     "content-type": "",
     "content-length": "",
     "connection": "",
     "vary": "",
     "date": "",
     "x-amzn-trace-id": "",
     "x-cache": "",
     "via": "",
     "x-amz-cf-pop": "",
     "x-amz-cf-id": ""
   }
   ```
5. HTTP body (m3u8)

</p></details>

## Intermediate Tutorial

The scripts below cache the list of active streams for 10 minutes.

### scripts/book.sh

```bash
bash book.sh DIRECTORY CHANNEL_COUNT
```

book.sh collects at least CHANNEL_COUNT channels and stores the data inside the DIRECTORY under the `kukudy/` directory.

> <details><summary>example</summary><p>
>
> To collect 100 channels and store the data inside the `kukudy/playground/` directory, run
>
> ```bash
> bash book.sh playground 100
> ```
>
> </p></details>

## Advanced Tutorials

For beginners, read the [VPN guide](#VPN-guide) below to set up the envoronment first.

### updateInfo.js

```bash
node ../updateInfo.js TARGET_COUNTRY
```

The `updateInfo.js` script checks if TARGET_COUNTRY is the user country detected by Twitch. Exit status is 0 if they are the same, 1 if different, 2 otherwise.

### scripts/bookvpn.sh

```bash
sudo bash bookvpn.sh DIRECTORY CHANNEL_COUNT CONFIG_ID...
```

bookvpn.sh connects to the VPN server(s) with CONFIG_ID(s) consecutively, collects at least CHANNEL_COUNT channels and stores the data inside the DIRECTORY under the `kukudy/` directory.

> <details><summary>example</summary><p>
>
> To connect to tw168.nordvpn.com and us9487.nordvpn.com consecutively to collect 100 channels and store the data inside `kukudy/playground/`, run
>
> ```bash
> sudo bash bookvpn.sh playground 100 tw168 us9487
> ```
>
> </p></details>

### scripts/pickybookvpn.sh

```bash
sudo bash pickybookvpn.sh DIRECTORY CHANNEL_COUNT CONFIG_ID...
```

`pickybookvpn.sh` connects to the VPN server(s) with CONFIG_ID(s) consecutively. In each round, it checks if the user country detected by Twitch is the country of the CONFIG_ID. If they do not match, it reconnects to the same CONFIG_ID and checks again. If it fails to be correctly recognized for seven times, the current CONFIG_ID is skipped. It collects at least CHANNEL_COUNT channels and stores the data inside the DIRECTORY under the `kukudy/` directory.

### scripts/bookvpnbycountry.sh

```bash
sudo bash bookvpnbycountry.sh DIRECTORY CHANNEL_COUNT COUNTRY...
```

> Use ISO 3166-1 alpha-2 codes for `COUNTRY...`.

bookvpnbycountry.sh connects to the VPN server(s) in the COUNTRY(ies) consecutively, collects at least CHANNEL_COUNT channels and stores the data inside the DIRECTORY under the `kukudy/` directory.

> <details><summary>example</summary><p>
>
> To connect to VPNs in Taiwan and the United States consecutively to collect 100 channels and store the data inside `kukudy/playground/`, run
>
> ```bash
> sudo bash bookvpnbycountry.sh playground 100 TW US
> ```
>
> </p></details>

### scripts/bookvpnbycity.sh

```bash
sudo bash bookvpnbycity.sh DIRECTORY CHANNEL_COUNT CITY...
```

bookvpnbycity.sh connects to the VPN server(s) in the CITY(ies) consecutively, collects at least CHANNEL_COUNT channels and stores the data inside the DIRECTORY under the `kukudy/` directory.

> <details><summary>example</summary><p>
>
> To connect to VPNs in Taipei and London consecutively to collect 100 channels and store the data inside `kukudy/playground/`, run
>
> ```bash
> sudo bash bookvpnbycity.sh playground 100 Taipei London
> ```
>
> </p></details>

### utils/getConfigIDByCountry.js

```bash
node getConfigIDByCountry.js COUNTRY
```

> Use ISO 3166-1 alpha-2 codes for `COUNTRY`.

getConfigIDByCountry.js gives the config ID of a VPN server in COUNTRY.

> <details><summary>example</summary><p>
>
> To get a config ID of a VPN server in Taiwan, run
>
> ```bash
> node getConfigIDByCountry.js TW
> ```
>
> </p></details>

### utils/getConfigIDByCity.js

```bash
node getConfigIDByCity.js CITY
```

getConfigIDByCity.js gives the config ID of a VPN server in CITY.

> <details><summary>example</summary><p>
>
> To get a config ID of a VPN server in Taipei, run
>
> ```bash
> node getConfigIDByCity.js Taipei
> ```
>
> </p></details>

## VPN guide

This tutorial shows kukudy users a way to set up the environment in order to access the VPN service provided by NordVPN.

Before we start, go to the `kukudy/` directory and do the following steps:

1. `mkdir nordvpn`
2. `cd nordvpn`

Let's go!

### 1. The auth.txt file

Kukudy connects to NordVPN's VPN server with the `openvpn` daemon, which authenticates using a username/password file.

Create an `auth.txt` file inside the `nordvpn/` directory with the following content.

```auth.txt
fjpLphPudtnCP9wzfP44sr54
eC4lqppwjdkZnM9V0MxpppZv
```

The lines above are example credentials. Get your own credentials.

Log in and go to [NordVPN's Dashboard](https://my.nordaccount.com/dashboard/nordvpn/). You should see your Username and Password in the _Service credentials (manual setup)_ section.

Replace the first line with your Username and the second line with your Password in the `auth.txt` file.

### 2. Update config files

Using the `openvpn` daemon, kukudy specifies the VPN server to connect to and the configurations with an `.ovpn` file provided by NordVPN.

Download the latest server list by running

```bash
wget https://downloads.nordcdn.com/configs/archives/servers/ovpn.zip
```

Unzip the `ovpn.zip` file by running

```bash
unzip ovpn.zip
```

The configuration files of two protocols TCP and UDP are stored inside two directories, `ovpn_tcp/` and `ovpn_udp/`. Kukudy uses UDP only.

#### OVPN_UDP/

Inside `ovpn_udp/` are `.ovpn` files.

Each filename starts with a server ID, which is a combination of a country code and an index number, followed by `.nordvpn.com.udp.ovpn`.

NordVPN updates their servers once in a while. Make sure you have the latest server list or you will not be able to connect to the new servers.

For more information about the content of `.ovpn` files, run `man openvpn`.

### 3. Connect

NordVPN provides a [server recommendation API](https://nordvpn.com/servers/tools/).

Let's say you get tw168.nordvpn.com. To connect to it, run the follwing command:

```bash
sudo openvpn --config nordvpn/ovpn_udp/tw168.nordvpn.com.udp.ovpn \
             --auth-user-pass nordvpn/auth.txt
```

When you see the message "Initialization Sequence Completed", congratulations! You are connected!

To kill the connection, press `control + c` on your keyboard.

In order to run the program in background, run the command with the `--daemon` option.

### P.S.

If you are using ssh to access mbox A, and the connection breaks after the mbox connects to the VPN, ssh to mbox A via mbox B and run these commands:

```bash
sudo ip rule add table 128 from NS.LAB.IP.MBOXA
sudo ip route add table 128 default via NS.LAB.IP.254
sudo ip route add table 128 to NS.LAB.IP.0/24 dev enp2s0
```

## Cron guide

`cron` is a daemon to execute scheduled commands. We can use `cron` to schedule probes.

Create a cron file named `kukudy` inside `/etc/cron.d/` with the following content.

```cron
PATH=...
DIR_K=...

# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12)
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7)
# |  |  |  |  |
# m h dom mon dow user command

14 03 01 * * USER cd ${DIR_K}/utils && node updateEnv.js
```

> Set the PATH variable to the string you see running `echo $PATH`.
> Set the DIR_K variable to the absolute path to the `kukudy` directory, i.e. what you see running `pwd` inside `kukudy/`.
> Replace USER with your user name, i.e. the string you see running `echo $USER`.

By doing so, updateEnv.js is scheduled to run on the first day of each month at 03:14 (local time).

For more information on the syntax of cron files, run `man 5 crontab`.
