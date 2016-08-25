'use strict';

//Nodejs modules.
const url = require('url');
const http = require('http');

/**
 * API key used to access the webapi more often than usual.
 * @type {String}
 */
const apiKey = 'YOUR_API_KEY_GOES_HERE';

const optionsHeaders = { 'X-Auth-Token': apiKey };

function Options(url) {
    this.protocol = url.protocol || 'http:';
    this.hostname = url.hostname;
    this.port = url.port || 80;
    this.method = url.method || 'GET';
    this.path = url.pathname || '/';
    this.headers = optionsHeaders;
}

/**
 * This function has the purpose of generify the code in order to be used to request any
 * endpoint given as parameter.
 */
function requestEndpoint(endpointUri, callback){

    const mainApiUrl = url.parse(endpointUri);
    const options = new Options(mainApiUrl);

    let req = http.request(options, (res) => {
        //TODO só 200 nao chega, pode receber 500 por exemplo..
        if (res.statusCode >= 500 && res.statusCode <= 505)
            return callback(new Error('Server Error'));
        if (res.statusCode != 200)
            return callback({badStatus: res.statusCode});

        res.setEncoding('utf8');
        let chunks = [];

        res.on("data", (chunk) => chunks.push(chunk));
        res.on('error', callback);
        res.on("end", () => { callback(null, JSON.parse(chunks.join(" "))); });
    });
    req.on('error', callback);
    req.end();
}


module.exports.requestEndpoint = requestEndpoint;
