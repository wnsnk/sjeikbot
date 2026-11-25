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
```bash
node getToken.js
```
## Updating the bot
```bash
git pull
```
## Running the bot
```bash
node bot.js
```