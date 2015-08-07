/**********************************************************\
|                                                          |
|                          hprose                          |
|                                                          |
| Official WebSite: http://www.hprose.com/                 |
|                   http://www.hprose.org/                 |
|                                                          |
\**********************************************************/

/**********************************************************\
 *                                                        *
 * WebSocketClient.Test.js                                *
 *                                                        *
 * hprose websocket client test for HTML5.                *
 *                                                        *
 * LastModified: Jul 16, 2015                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/*global hprose */
/*jshint eqeqeq:true, devel:true */

(function() {
    'use strict';
    var client = hprose.Client.create('ws://127.0.0.1:8080', ['hello']);
    client.ready(function(stub) {
        stub.hello.idempotent = true;
        stub.hello('World')
        .then(function(result) {
            console.info(result);
        },function(e) {
            console.error(e);
        });
        client.batch.begin();
        stub.hello('World 1')
        .then(function(result) {
            console.info(result);
        });
        stub.hello('World 2')
        .then(function(result) {
            console.info(result);
        });
        stub.hello('World 3')
        .then(function(result) {
            console.info(result);
        });
        client.batch.end();
    },
    function(e) {
        console.error(e);
    });
})();
