import twitchBot from './modules/twitch_bot.js';
import registerEventSub from './modules/registerSubscription.js';

import WebSocket from 'ws';
import 'dotenv/config';

const OAUTH_TOKEN = process.env.USER_ACCESS_TOKEN; // Needs scopes user:bot, user:read:chat, user:write:chat
const CLIENT_ID = process.env.CLIENT_ID;
const BROADCASTER_USER_ID = process.env.TWITCH_CHANNEL_USER_ID; // This is the User ID of the channel that the bot will join and listen to chat messages of
const BOT_USER_ID = process.env.TWITCH_BOT_USER_ID; // This is the User ID of the chat bot
const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';
const bot = new twitchBot(
    OAUTH_TOKEN,
    CLIENT_ID,
    BROADCASTER_USER_ID,
    BOT_USER_ID,
);
let websocketSessionID;

// Start executing the bot from here
(async () => {
    await getAuth();
    const websocketClient = startWebSocketClient();
})();

async function getAuth() {
    let response = await fetch('https://id.twitch.tv/oauth2/validate', {
        method: 'GET',
        headers: {
            Authorization: 'OAuth ' + OAUTH_TOKEN,
        },
    });

    if (response.status != 200) {
        let data = await response.json();
        console.error(
            'Token is not valid. /oauth2/validate returned status code ' +
                response.status,
        );
        console.error(data);
        process.exit(1);
    }
    console.log('Validated token.');
}

function startWebSocketClient() {
    let websocketClient = new WebSocket(EVENTSUB_WEBSOCKET_URL);

    websocketClient.on('error', console.error);

    websocketClient.on('open', () => {
        console.log('WebSocket connection opened to ' + EVENTSUB_WEBSOCKET_URL);
    });

    websocketClient.on('message', (data) => {
        handleWebSocketMessage(JSON.parse(data.toString()));
    });

    return websocketClient;
}

function handleWebSocketMessage(data) {
    switch (data.metadata.message_type) {
        case 'session_welcome': // First message you get from the WebSocket server when connecting
            websocketSessionID = data.payload.session.id; // Register the Session ID it gives us
            registerEventSubListeners();
            break;
        case 'notification': // An EventSub notification has occurred, such as channel.chat.message
            // console.log(data);
            switch (data.metadata.subscription_type) {
                case 'channel.chat.message':
                    const username = data.payload.event.chatter_user_login;
                    const message = data.payload.event.message.text;

                    console.log(`<${username}> ${message}`);
                    bot.respond(username, message);
                case 'channel.follow':
                    console.log('SOMEONE FOLLOWED');
                    bot.greetNewFollower(data.payload.event.user_name);
                    break;
                case 'channel.subscribe':
                    if (!data.payload.event.is_gift) {
                        bot.thankSubscriber(data.payload.event.user_name);
                    }
                    break;
                case 'channel.subscribe.gift':
                    bot.thankGiftSub(
                        data.payload.event.user_name,
                        data.payload.event.total,
                    );
                    break;
            }
            break;
    }
}

function registerEventSubListeners() {
    registerEventSub(
        'channel.chat.message',
        '1',
        {
            broadcaster_user_id: BROADCASTER_USER_ID,
            user_id: BOT_USER_ID,
        },
        websocketSessionID,
    );
    registerEventSub(
        'channel.follow',
        '2',
        {
            broadcaster_user_id: BROADCASTER_USER_ID,
            moderator_user_id: BOT_USER_ID,
        },
        websocketSessionID,
    );
    // STATUSCODE 403 FORBIDDEN
    // registerEventSub(
    //     'channel.subscribe',
    //     '1',
    //     {
    //         broadcaster_user_id: BROADCASTER_USER_ID,
    //     },
    //     websocketSessionID,
    // );
    // registerEventSub(
    //     'channel.subscribe.gift',
    //     '1',
    //     {
    //         broadcaster_user_id: BROADCASTER_USER_ID,
    //     },
    //     websocketSessionID,
    // );
}
