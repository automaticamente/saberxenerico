'use strict';

const request = require('./lib/request');
const cheerio = require('cheerio');

let title;

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

            const text = $('p').first().text();

            if (text.length > 140) {
                throw 'Too long';
            }

            console.log(title);
            console.log($('p').first().text());

        })
        .catch(error => console.error('Got this:', error));
}


bot();