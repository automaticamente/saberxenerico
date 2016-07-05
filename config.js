'use strict';

const _ = require('lodash');

module.exports = {
    twitterAPI: {
        consumer_key: '',
        consumer_secret: '',
        access_token: '',
        access_token_secret: ''
    },
    randomStatus: (title) => {
        return _.sample([
            'A que non sabías que...',
            `Hoxe non vas ir durmir sen saber algo de ${title}`,
            `É o momento de falar de ${title}`,
            `Nunca se fala suficiente de ${title}`,
            'Apunta isto, pode saírche nunha pregunta do Trivial'
        ]);
    }
};
