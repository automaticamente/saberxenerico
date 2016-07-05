'use strict';

const fs = require('fs');
const cheerio = require('cheerio');
const color = require('tinycolor2');

const request = require('./lib/request');
const cardify = require('./lib/cardify');

let title;

function bot() {
    request('https://gl.wikipedia.org/w/api.php?format=json&action=query&list=random&rnnamespace=0')
        .then(data => {
            title = JSON.parse(data).query.random[0].title;
            console.log(`https://gl.wikipedia.org/wiki/${title.replace(/\s/g, '_')}`);
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

            console.log(formattedText);

            return {
                text: `<span size="50000">${formattedText}</span>`,
                background,
                fill,
                size: '900x',
                font: 'Georgia'
            };

        })
        .then(cardify)
        .then(bf => fs.writeFileSync('./proba.png', bf))
        .catch(error => {
            console.error('Got this:', error.message);
            bot();
        });
}


bot();
