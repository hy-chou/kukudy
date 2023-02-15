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

Sign up for a Twitch account, log in and go to [Twitch Developers' Console](https://dev.twitch.tv/console). Click on *Register Your Application* in the *Application* section, fill out the form and click *Create*. You should see your application in the *Application* section. Click on *Manage* and you should see your Client ID and Client Secret.

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

Note that an access token expires in about two months, and if you do not get a new one, every request to Twitch API would return an HTTP error code 401. We recommend getting a new one every month.

## Quick start guide

This quick start guide, designed for first-time kukudy users, provides descriptions of the fundamental scripts inside `kukudy/`.

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
      "connection": string,
      "content-type": string,
      "access-control-allow-origin": string,
      "ratelimit-limit": digits,
      "ratelimit-remaining": digits,
      "ratelimit-reset": digits,
      "timing-allow-origin": string,
      "date": string,
      "x-served-by": string,
      "x-cache": string,
      "x-cache-hits": string,
      "x-timer": string,
      "vary": string,
      "strict-transport-security": string,
      "transfer-encoding": string,
    }
    ```
5. HTTP body (json) - Get Streams API [reference](https://dev.twitch.tv/docs/api/reference/#get-streams)

</p></details>

### 2. updateEdges.js (Deprecated since v1.1.0)

> **Deprecated:** This script is no longer recommended.
>
> ```bash
> node ../updateEdges.js
> ```
>
> The `updateEdges.js` script reads the latest stream list inside `ulgs/` to get the hostnames of the edge servers distributing the streams in the list.
>
> <details><summary>data format</summary><p>
>
> The data is stored in two formats inside two directories, `edgs/` and `dump/getVEH/`.
>
> #### EDGS/
>
> Inside `edgs/` are `.tsv` files.
>
> Each filename is the time `updateEdges.js` starts running in UTC.
>
> Each line has three tab-separated elements:
>
> 1. timestamp
> 2. response - either a hostname or an error message
> 3. user login
>
> #### DUMP/GETVEH/
>
> Inside `dump/getVEH/` are `.tsv` files.
>
> Each filename is the time `updateEdges.js` starts running in UTC.
>
> Each line has five tab-separated elements:
>
> 1. timestamp
> 2. user login
> 3. request type
> 4. HTTP headers (json)
> 5. HTTP body (json)
>
> </p></details>

### 2.1 updateInfo.js

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
      "NODE": "video-edge-" + six hexes + "." + IATA airport code + two digits,
      "MANIFEST-NODE-TYPE": "weaver_cluster",
      "MANIFEST-NODE": "video-weaver." + IATA airport code + two digits,
      "SUPPRESS": boolean,
      "SERVER-TIME": float,
      "TRANSCODESTACK": string,
      "USER-IP": IPv4 dot-decimal form,
      "SERVING-ID": hexes,
      "CLUSTER": IATA airport code + two digits,
      "ABS": boolean,
      "VIDEO-SESSION-ID": digits,
      "BROADCAST-ID": digits,
      "STREAM-TIME": float,
      "B": boolean,
      "USER-COUNTRY": ISO 3166-1 alpha-2 code,
      "MANIFEST-CLUSTER": IATA airport code + two digits,
      "ORIGIN": IATA airport code + two digits,
      "C": string,
      "D": boolean,
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
      "connection": string,
      "content-length": string,
      "content-type": string,
      "access-control-allow-origin": string,
      "date": string,
    }
    ```
5. HTTP body (json)
    ```json
    {
      "data": {
        "streamPlaybackAccessToken": {
          "value": string, // of a json object
          "signature": string,
          "__typename": string,
        }
      },
      "extensions": {
        "durationMilliseconds": Number,
        "operationName": string,
        "requestID": string,
      }
    }
    ```

#### DUMPS/REQUSHERM3U8/

Inside the `dumps/reqUsherM3U8/` directory are `.tsv` files.

Each filename is the UTC time shortly after `updateInfo.js` starts running.

Each line has five tab-separated elements:

1. timestamp - sent time
2. timestamp - received time
3. ...
4. HTTP headers (json) - all value are strings
    ```json
    {
      "content-type": string,
      "content-length": string,
      "connection": string,
      "vary": string,
      "date": string,
      "x-amzn-trace-id": string,
      "x-cache": string,
      "via": string,
      "x-amz-cf-pop": string,
      "x-amz-cf-id": string,
    }
    ```
5. HTTP body (m3u8)

</p></details>

## Intermediate Tutorials

### scripts/book.sh

```bash
bash book.sh TARGET_DIR CHANNEL_COUNT ROUND_COUNT
```

book.sh collects at least CHANNEL_COUNT channels for ROUND_COUNT rounds and stores the data inside the `kukudy/TARGET_DIR/` directory.

> <details><summary>example</summary><p>
>
> To collect 1000 channels for three times and store the data inside the `kukudy/playground/` directory, run
>
> ```bash
> bash book.sh playground 1000 3
> ```
>
> </p></details>

### scripts/bookvpn.sh

```bash
sudo bash bookvpn.sh TARGET_DIR CHANNEL_COUNT CONFIG_ID ...
```

bookvpn.sh connects to the VPN server whose id is CONFIG_ID, collects at least CHANNEL_COUNT channels and stores the data inside the `kukudy/TARGET_DIR/` directory.

> <details><summary>example</summary><p>
>
> To collect 1000 channels and store the data inside `kukudy/playground/` while connecting to tw168.nordvpn.com , run
>
> ```bash
> sudo bash bookvpn.sh playground 1000 tw168
> ```
>
> For beginners, read the [VPN guide](#VPN-guide) below to set up the envoronment first.
>
> </p></details>

### scripts/bookvpnbycountry.sh

```bash
sudo bash bookvpnbycountry.sh TARGET_DIR CHANNEL_COUNT COUNTRY...
```

>`COUNTRY...` are ISO 3166-1 alpha-2 codes.

bookvpnbycountry.sh connects with a VPN server in COUNTRY, collects at least CHANNEL_COUNT channels and stores the data inside the `kukudy/TARGET_DIR/` directory.

> <details><summary>example</summary><p>
>
> To collect 1000 channels and store the data inside `kukudy/playground/` while connecting to a VPN server in Taiwan , run
>
> ```bash
> sudo bash bookvpnbycountry.sh playground 1000 TW
> ```
>
> For beginners, read the [VPN guide](#VPN-guide) below to set up the envoronment first.
>
> </p></details>

### utils/getConfigIDByCountry.js

```bash
node getConfigIDByCountry.js COUNTRY
```

>`COUNTRY` is a ISO 3166-1 alpha-2 code.

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
> node getConfigIDByCity.js taipei
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

Log in and go to [NordVPN's Dashboard](https://my.nordaccount.com/dashboard/nordvpn/). You should see your Username and Password in the *Service credentials (manual setup)* section.

Replace the first line with your Username and the second line with your Password in the `auth.txt` file.

### 2. Update config files

Using the `openvpn` daemon, kukudy specifies the VPN server to connect to and the configurations with an `.ovpn` file provided by NordVPN.

Download the latest server list by running

```bash
wget https://downloads.nordcdn.com/configs/archives/servers/
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

14 03 * * * USER bash ${DIR_K}/scripts/book.sh playground 100 1
```

> Set the PATH variable to the string you see running `echo $PATH`.
> Set the DIR_K variable to the absolute path to the `kukudy` directory, i.e. what you see running `pwd` inside `kukudy/`.
> Replace USER with your user name, i.e. the string you see running `echo $USER`.

By doing so, book.sh is scheduled to run every day at 03:14 (local time).

For more information on the syntax of cron files, run `man 5 crontab`.
