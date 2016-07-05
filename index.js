'use strict';

const fs = require('fs');
const cheerio = require('cheerio');
const color = require('tinycolor2');

const request = require('./lib/request');
const cardify = require('./lib/cardify');
const tweeter = require('./lib/tweeter');

let title;

const config = fs.existsSync('./local.config.js') ?
    require('./local.config.js') :
    require('./config.js');

const T = new tweeter.Tweeter(config.twitterAPI);

function bot() {
    request('https://gl.wikipedia.org/w/api.php?format=json&action=query&list=random&rnnamespace=0')
        .then(data => {
            title = JSON.parse(data).query.random[0].title;

            return title;
        })
        .then(title => request(`https://gl.wikipedia.org/w/api.php?format=json&action=query&prop=extracts|pageimages&pithumbsize=600&redirects&titles=${title}`))
        .then(contents => {
            const pageContents = JSON.parse(contents).query.pages;
            const extract = pageContents[Object.keys(pageContents)[0]].extract;
            const $ = cheerio.load(extract);

            const text = $('p').first().html();

            if (text.length < 20 || text.length > 400) {
                throw new Error('Text out of reasonable limits');
            }

            if (text.match('referir|referencia')) {
                throw new Error('Possible disambiguation page');
            }

            const background = color.random().toHexString();
            const fill = color.mostReadable(background, ['#000', '#fff']).toHexString();

            const formattedText = text
                .replace(/<b>/gi, '<span bgcolor="' + fill + '" fgcolor="' + background + '"><b>')
                .replace(/<\/b>/gi, '</b></span>');

            return {
                text: `<span size="50000">${formattedText}</span>`,
                background,
                fill,
                size: '900x',
                font: 'Georgia'
            };

        })
        .then(cardify)
        .then(bf => T.tweetImageBuffer(bf, config.randomStatus(title)))
        .then(statusId => process.stdout.write(`https://twitter.com/saberxenerico/status/${statusId}\n`))
        .catch(error => {
            console.error('Got this:', error.message);
            bot();
        });
}


bot();
