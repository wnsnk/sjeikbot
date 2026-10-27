import 'dotenv/config';

const OAUTH_TOKEN = process.env.USER_ACCESS_TOKEN; // Needs scopes user:bot, user:read:chat, user:write:chat
const CLIENT_ID = process.env.CLIENT_ID;

/**
 * Please check the twitch docs: https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/
 * @param {string}  eventSubName  For example channel.chat.message.
 * @param {string} version The version used for the api as a string. For example '1'.
 * @param {object} condition The condition used in the body. For example {
                    broadcaster_user_id: CHAT_CHANNEL_USER_ID,
                    user_id: BOT_USER_ID,
                }
* @param websocketSessionID The websocketSessionID created.
 */
export default async function registerEventSub(
    eventsubName,
    version,
    condition,
    websocketSessionID,
) {
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
                version: version,
                condition: condition,
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
