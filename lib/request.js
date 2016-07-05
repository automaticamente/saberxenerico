'use strict';

const request = require('request');

module.exports = function requestPromise(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if(!error) {
                return resolve(body);
            }

            return reject(error);
        });
    })
};