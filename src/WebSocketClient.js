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
 * LastModified: Jul 20, 2015                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/* jshint -W067 */
(function (global, undefined) {
    'use strict';

    var Client = global.hprose.Client;
    var BytesIO = global.hprose.BytesIO;
    var Future = global.hprose.Future;

    function noop(){}
    function WebSocketClient(uri, functions) {
        if (this.constructor !== WebSocketClient) return new WebSocketClient(uri, functions);

        Client.call(this, uri, functions);
        this.timeout = 0;

        var _id = 0;
        var _count = 0;
        var _futures = [];
        var _keepAlive = true;
        var ready = null;
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
            ready.resolve(e);
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
            if (_count === 0) {
                if (!_keepAlive) close();
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
            ready = new Future();
            ws = new WebSocket(self.uri);
            ws.binaryType = 'arraybuffer';
            ws.onopen = onopen;
            ws.onmessage = onmessage;
            ws.onerror = noop;
            ws.onclose = onclose;
        }
        function sendAndReceive(request, env) {
            if (ws === null ||
                ws.readyState === WebSocket.CLOSING ||
                ws.readyState === WebSocket.CLOSED) {
                connect();
            }
            ++_count;
            var id = getNextId();
            var future = new Future();
            _futures[id] = future;
            ready.then(function() { send(id, request); });
            if (self.timeout > 0) {
                future = future.timeout(self.timeout).catchError(function(e) {
                    delete _futures[id];
                    --_count;
                    throw e;
                },
                function(e) {
                    return e instanceof TimeoutError;
                });
            }
            if (env.oneway) future.resolve();
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
        function setKeepAlive(value) {
            _keepAlive = !!value;
        }
        function getKeepAlive() {
            return _keepAlive;
        }

        Object.defineProperties(this, {
            sendAndReceive: { value: sendAndReceive },
            keepAlive: { get: getKeepAlive, set: setKeepAlive },
            close: { value: close }
        });
    }

    function checkuri(uri) {
        var parser = document.createElement('a');
        parser.href = uri;
        if (parser.protocol === 'ws:' ||
            parser.protocol === 'wss:') {
            return;
        }
        throw new Error('This client desn\'t support ' + parser.protocol + ' scheme.');
    }

    function create(uri, functions) {
        if (typeof uri === 'string') {
            checkuri(uri);
        }
        else if (Array.isArray(uri)) {
            uri.forEach(function(uri) { checkuri(uri); });
        }
        else {
            return new Error('You should set server uri first!');
        }
        return new WebSocketClient(uri, functions);
    }

    Object.defineProperty(WebSocketClient, 'create', { value: create });

    global.hprose.WebSocketClient = WebSocketClient;

}(function() {
    return this || (1, eval)('this');
}()));
