# kukudy

## Installation

1. `$ git clone git@github.com:hy-chou/kukudy.git`
2. `$ cd kukudy`
3. `$ npm install`
4. Create a `.env`:

```.env
CLIENT_ID="vje46w2kigic6v7q7fsf8qo38fyr95"
# CLIENT_SECRET="kf9vc5rnm89t71o20ax31t84wkanbz"
ACCESS_TOKEN="jmisglktaqh44h2eabposxqpwdycul" # 2022-09-11

CLIENT_ID_GQL="kimne78kx3ncx6brgo4mv6wki5h1ko"
```

## Quickstart

### Get the hostnames of the edges serving the top 100 channels

1. `$ mkdir pg`
2. `$ cd pg`
3. `$ node ../updateStreams.js`
4. `$ node ../updateEdges.js`

You will see the hostnames in the file inside `edgs/`.
You will see the user logins of the top 100 channels in the file inside `ulgs/`, and more information about the channels in the file inside `strm/`.

## Handling errors

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
