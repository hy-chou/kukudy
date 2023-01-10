# kukudy

## Prerequisites

- `node` and `npm`
- `openvpn`

## Installation

1. `$ git clone https://github.com/hy-chou/kukudy.git`
2. `$ cd kukudy/`
3. `$ npm install`
4. Create a `.env` file with the following content:

```.env
CLIENT_ID="vje46w2kigic6v7q7fsf8qo38fyr95"
# CLIENT_SECRET="kf9vc5rnm89t71o20ax31t84wkanbz"
ACCESS_TOKEN="jmisglktaqh44h2eabposxqpwdycul" # 2022-09-11

CLIENT_ID_GQL="kimne78kx3ncx6brgo4mv6wki5h1ko"
```

## Quick start guide

This tutorial gives basic instructions for the first-time probers to get started with kukudy.

### 1. The first probe

After installing kukudy, create a new directory named `playground` inside the root directory of kukudy, and go inside it. Next, run the following command:

```shell!
$ node ../updateStreams.js 100
```

Congratulations! You have done your first probe!

Let's see the data you just collected.

```shell!
$ ls -F
strm/  ulgs/
```

It seems like there are two directories. Let's check out `ulgs/` first.

#### ULGS/

There is a `.txt` file inside `ulgs/`. The filename is the UTC time of the probe. This file contains 100 user logins which belong to the top 100 live channels.

To print the file, run `$ cat FILE`.

The user logins are listed in descending order of viewer count. That is, the first channel has the most viewer of all live channels.

Is there more information about these channels? Let's move on to `strm/`.

#### STRM/

There is a `.json.txt` file inside `strm/`. The filename is also the UTC time of the probe. This file contains the raw response from [Twitch API](https://dev.twitch.tv/docs/api/reference#get-streams), including two sections, data and pagination. The extra information of the channels is in the data section.

To see the extra information about the first channel, run `$ cat FILE | jq '.data[0]'`.

### 2. Video edges

After the first probe, you have what it takes to find out the video edges serving these channels. Go back to the `playground/` and run the following command:

```shell!
$ node ../updateEdges.js
```

Let's see what's new inside `playground/`.

```shell!
$ ls -F
edgs/  strm/  ulgs/
```

It seems like there is a new directory called `edgs/`. Let's check it out.

#### EDGS/

There is a `.tsv` file inside `edgs/`. The filename is also a UTC timestamp.

To print the file, run `$ cat FILE`.

As you can see, there are three things in every line, a UTC timestamp, a hostname, and a user login.

To see only the hostnames, run `$ cat FILE | cut -f 2`. To count the hostnames, run `$ cat FILE | cut -f 2 | sort | uniq -c | sort -gr`.

As you can tell, there are channels sharing an edge.

### 3. Probe faster with a shell script

Typing the same commands is exhausting. Is there a way to probe using one command?

Yes.

Let's try to probe the top 200 channels for 3 times. Before the probe, make sure you know the absolute path to `kukudy/`. If not, run `$ echo $PWD` inside `kukudy/`.

Now, remove the `playground/` by `rm -r playground/`, and then run the following command:

```shell!
$ bash scripts/book.sh /ABS/PATH/TO/kukudy playground 200 3
```

When the jobs is done, you will see three files in `ulgs/`, three files in `strm/`, and three files in `edgs/`.

For more information on shell scripts, run `$ man bash`.

### 4. Schedule a probe with cron

Staying up late is tiring. Is it possible to probe when you are sleeping?

Yes.

Let's try to schedule a 1000-channel, 3-round probe at midnight.

Before the probe, make sure you know the absolute path to `kukudy/` and the user name of the mbox you are using. If not, run `$ echo $PWD` inside `kukudy/` and `$ echo $USER`.

Again, remove the `playground/` by `$ rm -r playground/`, create a cron file by running `$ sudo vim /etc/cron.d/kukudy`, and write the following lines.

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

For more information on the syntax of cron files, run `$ man 5 crontab`.

## VPN guide

Since CDN is designed to get close to end users, it does not feel right to stay at Taipei. It is time to go out and see the world -- with the help of a VPN.

In this example, you will use the `openvpn` daemon under UDP protocol to access the VPN service provided by NordVPN.

### 1. Update config files

Create a new directory named `nordvpn` inside the root directory of kukudy, go inside, and run the following commands to download the latest server list:

```shell
$ wget https://downloads.nordcdn.com/configs/archives/servers/ovpn.zip
$ unzip ovpn.zip
```

Each `.ovpn` file inside `nordvpn/ovpn_udp/` represents a server you can connect to. Each file name consists of a country code and an index number, followed by `.nordvpn.com.udp.ovpn`.

For more information about the content of `.ovpn` files, run `$ man openvpn`.

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
$ sudo openvpn --config nordvpn/ovpn_udp/tw168.nordvpn.com.udp.ovpn --auth-user-pass nordvpn/auth.txt
[sudo] password for nslab-m00:
...
```

When you see the message "Initialization Sequence Completed", congratulations! You are connected to the tw168 server!

To kill the connection, press `control + c` on your keyboard.

In order to run the program in background, add the option `--daemon`.

### P.S.

If you are using ssh to access mbox A, and the connection breaks after the mbox connects to the VPN, ssh to mbox A via mbox B and run these commands:

```shell
$ sudo ip rule add table 128 from NS.LAB.IP.MBOXA
$ sudo ip route add table 128 default via NS.LAB.IP.254
$ sudo ip route add table 128 to NS.LAB.IP.0/24 dev enp2s0
```

## Errors

### Request failed with status code 401

- You get 401 when the access token expires.
- To get a new token, use the following command. You can find the `CLIENT_ID` and `CLIENT_SECRET` in the `.env` file.

```shell!
$ curl -X POST 'https://id.twitch.tv/oauth2/token' \
       -F 'grant_type=client_credentials' \
       -F 'client_id=<CLIENT_ID goes here>' \
       -F 'client_secret=<CLIENT_SECRET goes here>'
```

- The reply will be in the json format.

```json!
{
  "access_token": "ntulee10lvwd19u69rt4f4lo2gm8vg",
  "expires_in": 4764969,
  "token_type": "bearer"
}
```

- Replace the access token in the `.env` file with the new one.
- An access token lasts about two months.
