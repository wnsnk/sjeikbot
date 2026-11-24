# sjeikbot

## Installation
- Install Node, npm and git.

```bash
git clone https://github.com/wnsnk/sjeikbot.git
cd sjeikbot
npm install
chmod +x generate_token.sh
```


## Authorization
### Environment variables
- Rename .env.example to .env and fill in all fields.
### Get user access token
Future version might do this automatically but for now:
-  <a href='https://dev.twitch.tv/docs/cli/'>Install the Twitch CLI</a>
```bash
./generate_token.sh
```
The CLI will ask for client_id and client_secret. You can find these at https://dev.twitch.tv/console under the apps.

- Copy and paste the User Access Token in the .env

## Updating the bot
```bash
git pull
```
## Running the bot
```bash
node bot.js
```