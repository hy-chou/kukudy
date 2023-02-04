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

This tutorial gives basic instructions for the first-time probers to get started with kukudy.

To get started, go to the `kukudy/` directory and do the following steps:

1. `mkdir playground`
2. `cd playground`

### updateStreams.js

```bash
node ../updateStreams.js [NUMBER_OF_CHANNELS]
```

> By default, `NUMBER_OF_CHANNELS` is 100.

The `updateStreams.js` script uses Twitch API's [Get Streams](https://dev.twitch.tv/docs/api/reference/#get-streams) to get a list of active streams, which is in descending order by the number of viewers watching the stream.

The list is stored in two formats inside two directories, `ulgs/` and `strm/`.

#### ULGS/

Inside `ulgs/` are `.txt` files.

Each filename is the time `updateStreams.js` starts running in UTC.

Each line is a user login, namely the name of a channel.

#### STRM/

Inside `strm/` are `.json.txt` files.

Each filename is the time `updateStreams.js` starts running in UTC.

Each line is the raw response from the Get Streams API.

### updateEdges.js

```bash
node ../updateEdges.js
```

The `updateEdges.js` script reads the latest stream list inside `ulgs/` to get the hostnames of the edge servers distributing the streams in the list.

The hostnames are stored inside the `edgs/` directory.

#### EDGS/

Inside `edgs/` are `.tsv` files.

Each filename is the time `updateEdges.js` starts running in UTC.

Each line has three items, a timestamp, a response, and a user login. The response is either the hostname of the edge server hosting the stream of the channel with the corresponding user login, or an error message.

## Advanced guide

### 3. Probe faster with a shell script

Typing the same commands is exhausting. Is there a way to probe using one command?

Yes.

Let's try to probe the top 200 channels for 3 times. Before the probe, make sure you know the absolute path to `kukudy/`. If not, run `echo $PWD` inside `kukudy/`.

Now, remove the `playground/` by `rm -r playground/`, and then run the following command:

```bash!
bash scripts/book.sh /ABS/PATH/TO/kukudy playground 200 3
```

When the jobs is done, you will see three files in `ulgs/`, three files in `strm/`, and three files in `edgs/`.

For more information on shell scripts, run `man bash`.

### 4. Schedule a probe with cron

Staying up late is tiring. Is it possible to probe when you are sleeping?

Yes.

Let's try to schedule a 1000-channel, 3-round probe at midnight.

Before the probe, make sure you know the absolute path to `kukudy/` and the user name of the mbox you are using. If not, run `echo $PWD` inside `kukudy/` and `echo $USER`.

Again, remove the `playground/` by `rm -r playground/`, create a cron file by running `sudo vim /etc/cron.d/kukudy`, and write the following lines.

```cron!
DIR_K=/ABS/PATH/TO/KUKUDY

# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12)
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7)
# |  |  |  |  |
# m h dom mon dow user command

59 23 * * * USER bash ${DIR_K}/scripts/book.sh ${DIR_K} playground 1000 3
```

By doing so, you schedule a 1000-channel 3-round probe every single night at 23:59 (local time).

For more information on the syntax of cron files, run `man 5 crontab`.

## VPN guide

Since CDN is designed to get close to end users, it does not feel right to stay at Taipei. It is time to go out and see the world -- with the help of a VPN.

In this example, you will use the `openvpn` daemon under UDP protocol to access the VPN service provided by NordVPN.

### 1. Update config files

Create a new directory named `nordvpn` inside the root directory of kukudy, go inside, and run the following commands to download the latest server list:

```bash
wget https://downloads.nordcdn.com/configs/archives/servers/ovpn.zip
unzip ovpn.zip
```

Each `.ovpn` file inside `nordvpn/ovpn_udp/` represents a server you can connect to. Each file name consists of a country code and an index number, followed by `.nordvpn.com.udp.ovpn`.

For more information about the content of `.ovpn` files, run `man openvpn`.

### 2. Authentication

You need one last thing to connect to NordVPN's server: the authentication codes.

Create a file named `auth.txt` inside `nordvpn/`. Open a browser and log in to nordvpn.com, find the Service credentials section, copy Username and Password, and paste them in separate lines in `auth.txt`. It should look something like this:

```auth.txt
fjpLphPudtnCP9wzfP44sr54
eC4lqppwjdkZnM9V0MxpppZv
```

### 3. Connect

Run the follwing command:

```bash
sudo openvpn --config nordvpn/ovpn_udp/tw168.nordvpn.com.udp.ovpn \
             --auth-user-pass nordvpn/auth.txt
```

When you see the message "Initialization Sequence Completed", congratulations! You are connected to the tw168 server!

To kill the connection, press `control + c` on your keyboard.

In order to run the program in background, add the option `--daemon`.

### P.S.

If you are using ssh to access mbox A, and the connection breaks after the mbox connects to the VPN, ssh to mbox A via mbox B and run these commands:

```bash
sudo ip rule add table 128 from NS.LAB.IP.MBOXA
sudo ip route add table 128 default via NS.LAB.IP.254
sudo ip route add table 128 to NS.LAB.IP.0/24 dev enp2s0
```

## Routines

### Update the access token every 2 months

You get error code 401 when the access token expires. To get a new token, run the following command.

```bash
curl -X POST 'https://id.twitch.tv/oauth2/token' \
     -F 'grant_type=client_credentials' \
     -F 'client_id=<CLIENT_ID goes here>' \
     -F 'client_secret=<CLIENT_SECRET goes here>'
```

You can find `CLIENT_ID` and `CLIENT_SECRET` in `.env`.

The reply is in the json format.

```json
{
  "access_token": "0vbuo8rvancxeuvon7k975jf66b5sq",
  "expires_in": 4533330,
  "token_type": "bearer"
}
```

Replace the access token in `.env` with the new one.

### Update the config files

NordVPN updates their servers once in a while. Make sure you have the latest server list or you will not be able to connect to the new servers.
