'use strict';

export default class twitchBot {
    constructor(
        OAUTH_TOKEN,
        CLIENT_ID,
        BROADCASTER_USER_ID,
        BOT_USER_NAME,
        BOT_USER_ID,
    ) {
        this.OAUTH_TOKEN = OAUTH_TOKEN;
        this.CLIENT_ID = CLIENT_ID;
        this.BROADCASTER_USER_ID = BROADCASTER_USER_ID;
        ((this.BOT_USER_NAME = BOT_USER_NAME),
            (this.BOT_USER_ID = BOT_USER_ID));
        // TEST IF THIS WORKS this.viewerscache and this.startRemindFollowInterval
        this.viewersCache = {};
        this.startRemindFollowInterval();
    }
    /**
     * respond to messages send in chat
     * @param {string} userName - The name of the user sending the message.
     * @param {string} message - The message send.
     */
    respond(userName, message) {
        if (userName === this.BOT_USER_NAME) {
            return;
        }
        message = message.toLowerCase();
        switch (true) {
            // STARTSWITH
            case message.startsWith('!dnd'):
                this.dnd(userName);
                break;
            case message.startsWith('!kenikjou'):
                this.rolDeWorst();
                break;
            case message.startsWith('!mop'):
                this.joke();
                break;
            case message.startsWith('!lengte'):
                this.calcPSize(userName);
                break;
            case message.startsWith('!flirt'):
                this.flirt(userName);
                break;
            // INCLUDES
            case message.includes('mark'):
                this.mark();
                break;
            case message.includes('akashi'):
                this.akashiSneeze();
                break;
        }
    }
    async sendChatMessage(chatMessage) {
        let response = await fetch(
            'https://api.twitch.tv/helix/chat/messages',
            {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.OAUTH_TOKEN,
                    'Client-Id': this.CLIENT_ID,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    broadcaster_id: this.BROADCASTER_USER_ID,
                    sender_id: this.BOT_USER_ID,
                    message: chatMessage,
                }),
            },
        );

        if (response.status != 200) {
            let data = await response.json();
            console.error('Failed to send chat message');
            console.error(data);
        } else {
            console.log('Sent chat message: ' + chatMessage);
        }
    }

    // CHAT COMMANDS
    dnd(userName) {
        let randomNum = Math.floor(Math.random() * 21) + 1;
        let sentence = `@${userName} rolde een ${randomNum}.`;

        if (randomNum <= 5) {
            this.sendChatMessage(`${sentence} holysjeFacepalm holysjeFacepalm`);
        } else if (randomNum <= 10) {
            this.sendChatMessage(`${sentence} Matigg holysjeFacepalm`);
        } else if (randomNum <= 15) {
            this.sendChatMessage(`${sentence} Redelijk goed joh`);
        } else if (randomNum <= 19) {
            this.sendChatMessage(`${sentence} HUTS A NIFFAUW holysjeDuimpie`);
        } else if (randomNum === 20) {
            this.sendChatMessage(
                `${sentence} Beter koop je een kraslot holysjeDuimpie holysjeDuimpie holysjeDuimpie`,
            );
        } else {
            this.sendChatMessage(
                `@${userName} rolde te enthousiast en de dobbelsteen rolde weg :( holysjeFacepalm`,
            );
        }
    }

    rolDeWorst() {
        this.sendChatMessage(
            'Ken ik jou? Rol de worst holysjeRolDeWorst holysjeRolDeWorst holysjeRolDeWorst holysjeRolDeWorst',
        );
    }

    mark() {
        this.sendChatMessage('EL FAMILIO!!');
    }

    joke() {
        const jokes = [
            'Wat is het verschil tussen een appel en een peer?',
            'Staat een man op de bus te wachten. zegt de buschauffeur: "Kom er eens vanaf joh"',
        ];
        this.sendChatMessage(jokes[Math.floor(Math.random() * jokes.length)]);
    }
    akashiSneeze() {
        this.sendChatMessage('Gezondheid holysjeDuimpie');
    }
    calcPSize(userName) {
        const randomSize = Math.floor(Math.random() * 40 + 1);
        const randomDecimal = Math.floor(Math.random() * 9 + 1);
        let sentence = `@${userName} heeft een lengte van ${randomSize},${randomDecimal}cm in de boks hangen.`;
        if (randomSize <= 12) {
            this.sendChatMessage(`${sentence} Het is vast koud hier.`);
        } else if (randomSize > 25) {
            this.sendChatMessage(`Jeeeezus.... ${sentence}`);
        } else {
            this.sendChatMessage(sentence);
        }
    }

    async flirt(userName) {
        const chatters = await this.getChatters();
        const randomChatter =
            chatters[Math.floor(Math.random() * chatters.length)];
        this.sendChatMessage(
            `FIIIIIIET FIEEUW?!?!?! @${userName} flirt met @${randomChatter}`,
        );
    }
    // OTHER CHAT FUNCTIONS
    remindFollow() {
        this.sendChatMessage('Ga effe volgen ofzo joh');
    }
    async startRemindFollowInterval() {
        setInterval(() => this.remindFollow(), 1200000);
    }

    greetNewFollower(userName) {
        this.sendChatMessage(
            `@${userName} is de nieuwe sidekick! holysjeDuimpie holysjeDuimpie`,
        );
    }

    thankSubscriber(userName) {
        this.sendChatMessage(
            `@${userName} is zojuist geabonneerd! Zonde van je geld.`,
        );
    }
    thankGiftSub(userName, totalGiftSubs) {
        this.sendChatMessage(
            `@${userName} heeft zojuist ${totalGiftSubs} subjes weggegeven! holysjeDuimpie holysjeDuimpie`,
        );
    }
    /**
     * checks the cache first and only fetches the active chatters via the twitch api if cache does not exist or is expired
     * @returns {array} A list of active chatters
     */
    async getChatters() {
        if (Object.keys(this.viewersCache).length === 0) {
            const userNames = await fetchChatters(
                this.OAUTH_TOKEN,
                this.CLIENT_ID,
                this.BROADCASTER_USER_ID,
                this.BOT_USER_ID,
            );
            this.cacheChatters(userNames);
            return userNames;
        } else {
            if (this.viewersCache['expires'] < Date.now()) {
                console.log('Cache exists but is expired');
                const userNames = await fetchChatters(
                    this.OAUTH_TOKEN,
                    this.CLIENT_ID,
                    this.BROADCASTER_USER_ID,
                    this.BOT_USER_ID,
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
                user['user_login'] === 'streamelements'
            ) {
                console.log('ignored: ' + user['user_login']);
            } else {
                userNames.push(user['user_name']);
            }
        }
        return userNames;
    } catch (error) {
        console.error(error.message);
    }
}
