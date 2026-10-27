'use strict';

export default class twitchBot {
    constructor() {}
    viewersCache = {};
    dnd(userName) {
        let randomNum = Math.floor(Math.random() * 21) + 1;
        let sentence = `@${userName} rolde een ${randomNum}.`;

        if (randomNum <= 5) {
            return `${sentence} Tering slecht..`;
        } else if (randomNum <= 10) {
            return `${sentence} Matig`;
        } else if (randomNum <= 15) {
            return `${sentence} Redelijk goed joh`;
        } else if (randomNum <= 19) {
            return `${sentence} HUTS A NIFFAUW`;
        } else if (randomNum === 20) {
            return `${sentence} Beter koop je een kraslot`;
        } else {
            return `@${userName} rolde te enthousiast en de dobbelsteen rolde weg :(`;
        }
    }

    rolDeWorst() {
        return 'Ken ik jou? Rol de worst holysjeRolDeWorst holysjeRolDeWorst holysjeRolDeWorst holysjeRolDeWorst';
    }

    mark() {
        return 'EL FAMILIO!!';
    }

    joke() {
        const jokes = ['Wat is het verschil tussen een appel en een peer?'];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    remindFollow() {
        return 'Ga effe volgen ofzo joh';
    }

    greetNewFollower(userName) {
        return `@${userName} is de nieuwe sidekick!`;
    }

    async flirt(
        userName,
        OAUTH_TOKEN,
        CLIENT_ID,
        broadcaster_id,
        moderator_user_id,
    ) {
        const chatters = await this.getChatters(
            OAUTH_TOKEN,
            CLIENT_ID,
            broadcaster_id,
            moderator_user_id,
        );
        const randomChatter =
            chatters[Math.floor(Math.random() * chatters.length)];
        return `FIIIIIIET FIEEUW?!?!?! @${userName} flirt met @${randomChatter}`;
    }

    /**
     * checks the cache first and only fetches the active chatters via the twitch api if cache does not exist or is expired
     *
     * @param   {string} OAUTH_TOKEN the user_access_token of the bot
     * @param   {string} CLIENT_ID the client_id of the bot
     * @param   {string} broadcaster_id the id of the channel that is streaming
     * @param   {string} moderator_user_id the user_id of this bot
     * @returns {array} A list of active chatters
     */
    async getChatters(
        OAUTH_TOKEN,
        CLIENT_ID,
        broadcaster_id,
        moderator_user_id,
    ) {
        if (Object.keys(this.viewersCache).length === 0) {
            console.log('Cache is empty');
            const userNames = await fetchChatters(
                OAUTH_TOKEN,
                CLIENT_ID,
                broadcaster_id,
                moderator_user_id,
            );
            this.cacheChatters(userNames);
            return userNames;
        } else {
            if (this.viewersCache['expires'] < Date.now()) {
                console.log('Cache exists but is expired');
                const userNames = await fetchChatters(
                    OAUTH_TOKEN,
                    CLIENT_ID,
                    broadcaster_id,
                    moderator_user_id,
                );
                return userNames;
            } else {
                return this.viewersCache['viewers'];
            }
        }
    }
    /**
     * Saves array of active chatters in this.viewersCache
     *
     * @param   {array} chatters  list of chatters.
     */
    cacheChatters(chatters) {
        this.viewersCache = { viewers: chatters, expires: Date.now() + 600000 };
    }
}

/**
 * fetches the active chatters via the twitch api. Warning i have not tested what happens if the api fails xxx
 *
 * @param   {string} OAUTH_TOKEN the user_access_token of the bot
 * @param   {string} CLIENT_ID the client_id of the bot
 * @param   {string} broadcaster_id the id of the channel that is streaming
 * @param   {string} moderator_user_id the user_id of this bot
 * @returns {array} A list of active chatters
 */
async function fetchChatters(
    OAUTH_TOKEN,
    CLIENT_ID,
    broadcaster_id,
    moderator_user_id,
) {
    try {
        let response = await fetch(
            'https://api.twitch.tv/helix/chat/chatters?' +
                new URLSearchParams({
                    broadcaster_id: broadcaster_id,
                    moderator_id: moderator_user_id,
                }),
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + OAUTH_TOKEN,
                    'Client-Id': CLIENT_ID,
                    'Content-Type': 'application/json',
                },
            },
        );
        if (!response.ok) {
            console.log(response);
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        // console.log(result);
        const userNames = [];
        for (const user of result['data']) {
            if (
                user['user_login'] === 'nightbot' ||
                user['user_login' === 'streamelements']
            ) {
                continue;
            }
            userNames.push(user['user_name']);
        }
        return userNames;
    } catch (error) {
        console.error(error.message);
    }
}
