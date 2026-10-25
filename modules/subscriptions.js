import 'dotenv/config';

const BOT_USER_ID = process.env.TWITCH_BOT_USER_ID; // This is the User ID of the chat bot
const OAUTH_TOKEN = process.env.USER_ACCESS_TOKEN; // Needs scopes user:bot, user:read:chat, user:write:chat
const CLIENT_ID = process.env.CLIENT_ID;
const CHAT_CHANNEL_USER_ID = process.env.TWITCH_CHANNEL_USER_ID; // This is the User ID of the channel that the bot will join and listen to chat messages of

let websocketSessionID;

export async function registerChannelChatMessage() {
    const eventsubName = 'channel.chat.message';
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
                type: eventsubName,
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
            `Failed to subscribe to ${eventsubName} API call returned status code ` +
                response.status,
        );
        console.error(data);
        process.exit(1);
    } else {
        const data = await response.json();
        console.log(`Subscribed to ${eventsubName} [${data.data[0].id}]`);
    }
}

export async function registerChannelFollow() {
    const eventsubName = 'channel.follow';
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
                type: eventsubName,
                version: '2',
                condition: {
                    broadcaster_user_id: CHAT_CHANNEL_USER_ID,
                    moderator_user_id: BOT_USER_ID,
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
            `Failed to subscribe to ${eventsubName} API call returned status code ` +
                response.status,
        );
        console.error(data);
        process.exit(1);
    } else {
        const data = await response.json();
        console.log(`Subscribed to ${eventsubName} [${data.data[0].id}]`);
    }
}

export async function registerChannelSubscription() {
    const eventsubName = 'channel.subscribe';
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
                type: eventsubName,
                version: '1',
                condition: {
                    broadcaster_user_id: CHAT_CHANNEL_USER_ID,
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
            `Failed to subscribe to ${eventsubName} API call returned status code ` +
                response.status,
        );
        console.error(data);
        process.exit(1);
    } else {
        const data = await response.json();
        console.log(`Subscribed to ${eventsubName} [${data.data[0].id}]`);
    }
}

export async function registerChannelSubscriptionGift() {
    const eventsubName = 'channel.subscription.gift';
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
                type: eventsubName,
                version: '1',
                condition: {
                    broadcaster_user_id: CHAT_CHANNEL_USER_ID,
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
            `Failed to subscribe to ${eventsubName} API call returned status code ` +
                response.status,
        );
        console.error(data);
        process.exit(1);
    } else {
        const data = await response.json();
        console.log(`Subscribed to ${eventsubName} [${data.data[0].id}]`);
    }
}
