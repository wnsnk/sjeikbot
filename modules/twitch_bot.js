'use strict';

export default class twitchBot {
    constructor() {}

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
        return 'Ken ik jou? Rol de worst';
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
}
