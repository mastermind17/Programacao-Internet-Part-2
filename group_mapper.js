//sudo mkdir -p /var/run/couchdb
//sudo chown couchdb:couchdb /var/run/couchdb
//sudo su couchdb -c /usr/bin/couchdb
//
//curl http://127.0.0.1:5984
//
//curl -X DELETE http://127.0.0.1:5984/groups/
//curl -X GET http://127.0.0.1:5984/groups/1
//curl -X PUT http://127.0.0.1:5984/groups/1 -d '{"name":"Masterminds","Teams":[]}'

"use strict";

const http = require('http');
const async = require('async');

let dbGroups = {};

/*
 * Clear cache bdGroups
 */
exports.clearCache = function() {
    dbGroups = {};
};

function Options(p, m) {
    this.protocol = 'http:';
    this.hostname = process.env.COUCHIP || "127.0.0.1";
    this.port = process.env.COUCHPORT || 5984;
    //	this.uri = 'http://127.0.0.1:5984/groups/1';
    this.method = m || 'GET';
    this.path = p || '/groups';
    //	this.headers = {accept: 'application/json', 'content-type': 'application/json'};
}

function Group(dbObject) {
    // id is the name of the group without blank spaces
    // it is used on the uri that identifies the group
    this._id = dbObject._id;
    this.name = dbObject.name;
    this.teams = dbObject.teams;
}

/*
 * callback's descriptor: (Error, id) => void
 */
exports.insert = function(group, callback) {
    const opt = new Options('/groups', 'POST');
    opt.headers = {
        'Content-Type': 'application/json'
    };
    const request = http.request(opt, resp => {
        let result = '';
        resp.on('error', callback);
        resp.on('data', data => result += data);
        resp.on('end', () => callback(null, JSON.parse(result).id));
    });
    request.write(JSON.stringify(group));
    request.on('error', callback);
    request.end();
};

/*
 * callback's descriptor: (Error, Group) => void
 */
exports.get = function(id, callback) {
    const opt = new Options('/groups/' + id);
    opt.headers = {
        'Content-Type': 'application/json'
    };
    const request = http.request(opt, resp => {
        let result = '';
        resp.on('error', callback);
        resp.on('data', data => result += data);
        resp.on('end', () => {
            const g = JSON.parse(result);
            dbGroups[g._id] = g;
            callback(null, new Group(g));
        });
    });
    request.on('error', callback);
    request.end();

};

/*
 * callback's descriptor: (Error, Group[]) => void
 */
exports.getAll = function(callback) {
    const opt = new Options('/groups/_all_docs');
    let operations = [];
    const request = http.request(opt, resp => {
        let result = '';
        resp.on('error', callback);
        resp.on('data', data => result += data);
        resp.on('end', () => {
            result = JSON.parse(result);
            for (let val of result.rows) {
                operations.push((finish) => exports.get(val.id, finish));
            }
            async.parallel(operations, callback);
        });
    });
    request.on('error', callback);
    request.end();
};

/*
 * callback's descriptor: (Error) => void
 */
exports.update = function(group, callback) {
    const g = dbGroups[group._id];
    if (!g){
            callback(new Error('You must fetch the task before update it!'));
    }else {
        const opt = new Options(
            '/groups/' + group._id + '?rev=' + g._rev,
            'PUT');
        opt.headers = {
            'Content-Type': 'application/json'
        };
        const request = http.request(opt, resp => {
            resp.on('error', callback);
            resp.on('data', () => {});
            resp.on('end', callback);
        });
        request.write(JSON.stringify(group));
        request.on('error', callback);
        request.end();
    }
};

/*
 * callback's descriptor: (Error) => void
 */
exports.delete = function(id, callback) {
        const g = dbGroups[id];
        if (!g){
            callback(new Error('You must fetch the Group before update it!'));
        }else {
            const opt = new Options(
                '/groups/' + id + '?rev=' + g._rev,
                'DELETE');
            opt.headers = { 'Content-Type': 'application/json' };
            const request = http.request(opt, resp => {
            resp.on('error', callback);
            resp.on('data', () => {});
            resp.on('end', () => callback(null));
        });
        request.on('error', callback);
        request.end();
        }
};
