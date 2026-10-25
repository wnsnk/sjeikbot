import twitchBot from './modules/twitch_bot.js';
const bot = new twitchBot();
import WebSocket from 'ws';
import 'dotenv/config';

const BOT_USER_ID = process.env.TWITCH_BOT_USER_ID; // This is the User ID of the chat bot
const OAUTH_TOKEN = process.env.USER_ACCESS_TOKEN; // Needs scopes user:bot, user:read:chat, user:write:chat
const CLIENT_ID = process.env.CLIENT_ID;

const CHAT_CHANNEL_USER_ID = process.env.TWITCH_CHANNEL_USER_ID; // This is the User ID of the channel that the bot will join and listen to chat messages of

const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';

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

            // Listen to EventSub, which joins the chatroom from your bot's account
            registerEventSubListeners();
            break;
        case 'notification': // An EventSub notification has occurred, such as channel.chat.message
            switch (data.metadata.subscription_type) {
                case 'channel.chat.message':
                    console.log(data.payload.event.message);
                    // First, print the message to the program's console.
                    console.log(
                        `MSG #${data.payload.event.broadcaster_user_login} <${data.payload.event.chatter_user_login}> ${data.payload.event.message.text}`,
                    );

                    // Then check to see if that message was "HeyGuys"
                    if (data.payload.event.message.text.trim() == '!dnd') {
                        // If so, send back "VoHiYo" to the chatroom
                        sendChatMessage(
                            bot.dnd(data.payload.event.chatter_user_login),
                        );
                    }

                    break;
            }
            break;
    }
}

async function sendChatMessage(chatMessage) {
    let response = await fetch('https://api.twitch.tv/helix/chat/messages', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + OAUTH_TOKEN,
            'Client-Id': CLIENT_ID,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            broadcaster_id: CHAT_CHANNEL_USER_ID,
            sender_id: BOT_USER_ID,
            message: chatMessage,
        }),
    });

    if (response.status != 200) {
        let data = await response.json();
        console.error('Failed to send chat message');
        console.error(data);
    } else {
        console.log('Sent chat message: ' + chatMessage);
    }
}

async function registerEventSubListeners() {
    // Register channel.chat.message
    let response = await fetch(
        'https://api.twitch.tv/helix/eventsub/subscriptions',
        {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + OAUTH_TOKEN,
                'Client-Id': CLIENT_ID,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'channel.chat.message',
                version: '1',
                condition: {
                    broadcaster_user_id: CHAT_CHANNEL_USER_ID,
                    user_id: BOT_USER_ID,
                },
                transport: {
                    method: 'websocket',
                    session_id: websocketSessionID,
                },
            }),
        },
    );

    if (response.status != 202) {
        let data = await response.json();
        console.error(
            'Failed to subscribe to channel.chat.message. API call returned status code ' +
                response.status,
        );
        console.error(data);
        process.exit(1);
    } else {
        const data = await response.json();
        console.log(`Subscribed to channel.chat.message [${data.data[0].id}]`);
    }
}
