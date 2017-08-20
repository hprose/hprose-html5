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
 * WebSocketClient.js                                     *
 *                                                        *
 * hprose websocket client for HTML5.                     *
 *                                                        *
 * LastModified: Aug 20, 2017                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (hprose, global, undefined) {
    'use strict';

    var BytesIO = hprose.BytesIO;
    var Client = hprose.Client;
    var Future = hprose.Future;
    var TimeoutError = global.TimeoutError;
    var parseuri = hprose.parseuri;

    var WebSocket = global.WebSocket || global.MozWebSocket;

    function noop(){}
    function WebSocketClient(uri, functions, settings) {
        if (typeof(WebSocket) === "undefined") {
            throw new Error('WebSocket is not supported by this browser.');
        }
        if (this.constructor !== WebSocketClient) {
            return new WebSocketClient(uri, functions, settings);
        }

        Client.call(this, uri, functions, settings);

        var _id = 0;
        var _count = 0;
        var _futures = [];
        var _requests = [];
        var _ready = null;
        var ws = null;

        var self = this;

        function getNextId() {
            return (_id < 0x7fffffff) ? ++_id : _id = 0;
        }
        function send(id, request) {
            var bytes = new BytesIO();
            bytes.writeInt32BE(id);
            if (request.constructor === String) {
                bytes.writeString(request);
            }
            else {
                bytes.write(request);
            }
            var message = bytes.bytes;
            if (ArrayBuffer.isView) {
                ws.send(message);
            }
            else if (message.buffer.slice) {
                ws.send(message.buffer.slice(0, message.length));
            }
            else {
                ws.send(message.buffer);
            }
        }
        function onopen(e) {
            _ready.resolve(e);
        }
        function onmessage(e) {
            var bytes = new BytesIO(e.data);
            var id = bytes.readInt32BE();
            var future = _futures[id];
            delete _futures[id];
            if (future !== undefined) {
                --_count;
                future.resolve(bytes.read(bytes.length - 4));
            }
            if ((_count < 100) && (_requests.length > 0)) {
                ++_count;
                var request = _requests.pop();
                _ready.then(function() { send(request[0], request[1]); });
            }
            if (_count === 0 && !self.keepAlive) {
                close();
            }
        }
        function onclose(e) {
            _futures.forEach(function(future, id) {
                future.reject(new Error(e.code + ':' + e.reason));
                delete _futures[id];
            });
            _count = 0;
            ws = null;
        }
        function connect() {
            _ready = new Future();
            ws = new WebSocket(self.uri);
            ws.binaryType = 'arraybuffer';
            ws.onopen = onopen;
            ws.onmessage = onmessage;
            ws.onerror = noop;
            ws.onclose = onclose;
        }
        function sendAndReceive(request, context) {
            var id = getNextId();
            var future = new Future();
            _futures[id] = future;
            if (context.timeout > 0) {
                future = future.timeout(context.timeout).catchError(function(e) {
                    delete _futures[id];
                    --_count;
                    close();
                    throw e;
                },
                function(e) {
                    return e instanceof TimeoutError;
                });
            }
            if (ws === null ||
                ws.readyState === WebSocket.CLOSING ||
                ws.readyState === WebSocket.CLOSED) {
                connect();
            }
            if (_count < 100) {
                ++_count;
                _ready.then(function() { send(id, request); });
            }
            else {
                _requests.push([id, request]);
            }
            if (context.oneway) { future.resolve(); }
            return future;
        }
        function close() {
            if (ws !== null) {
                ws.onopen = noop;
                ws.onmessage = noop;
                ws.onclose = noop;
                ws.close();
            }
        }

        Object.defineProperties(this, {
            sendAndReceive: { value: sendAndReceive },
            close: { value: close }
        });
    }

    function checkuri(uri) {
        var parser = parseuri(uri);
        if (parser.protocol === 'ws:' ||
            parser.protocol === 'wss:') {
            return;
        }
        throw new Error('This client desn\'t support ' + parser.protocol + ' scheme.');
    }

    function create(uri, functions, settings) {
        if (typeof uri === 'string') {
            checkuri(uri);
        }
        else if (Array.isArray(uri)) {
            uri.forEach(function(uri) { checkuri(uri); });
        }
        else {
            throw new Error('You should set server uri first!');
        }
        return new WebSocketClient(uri, functions, settings);
    }

    Object.defineProperty(WebSocketClient, 'create', { value: create });

    hprose.WebSocketClient = WebSocketClient;

})(hprose, hprose.global);
