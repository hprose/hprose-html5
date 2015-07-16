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
 * LastModified: Jul 15, 2015                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/* jshint -W067 */
(function (global, undefined) {
    'use strict';

    var Client = global.hprose.Client;
    var BytesIO = global.hprose.BytesIO;
    var Completer = global.hprose.Completer;

    function noop(){}
    function WebSocketClient(uri, functions) {
        if (this.constructor !== WebSocketClient) return new WebSocketClient(uri, functions);

        Client.call(this, uri, functions);
        this.timeout = 0;

        var _id = 0;
        var _count = 0;
        var _reqcount = 0;
        var _completers = Object.create(null);
        var _timeoutIds = Object.create(null);
        var _requests = Object.create(null);
        var _keepAlive = true;
        var ready = false;
        var ws = null;

        var self = this;

        function getNextId() {
            return (_id < 0x7fffffff) ? ++_id : _id = 0;
        }
        function send(id, request) {
            var bytes = new BytesIO();
            bytes.writeByte((id >> 24) & 0xff);
            bytes.writeByte((id >> 16) & 0xff);
            bytes.writeByte((id >> 8) & 0xff);
            bytes.writeByte(id & 0xff);
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
            ready = true;
            if (_reqcount > 0) {
                for (var id in _requests) {
                    send(id, _requests[id]);
                    delete _requests[id];
                }
            }
            _reqcount = 0;
        }
        function onmessage(e) {
            var bytes = new BytesIO(e.data);
            var id = bytes.readByte() << 24;
            id = id | bytes.readByte() << 16;
            id = id | bytes.readByte() << 8;
            id = id | bytes.readByte();
            var timeoutId = _timeoutIds[id];
            var completer = _completers[id];
            delete _timeoutIds[id];
            delete _completers[id];
            if (timeoutId !== undefined) {
                global.clearTimeout(timeoutId);
            }
            if (completer !== undefined) {
                --_count;
                completer.complete(bytes.read(bytes.length - 4));
            }
            if (_count === 0) {
                if (!_keepAlive) close();
            }
        }
        function onclose(e) {
            onerror(e);
            ws = null;
        }
        function onerror(e) {
            for (var id in _completers) {
                var timeoutId = _timeoutIds[id];
                var completer = _completers[id];
                if (timeoutId !== undefined) {
                    global.clearTimeout(timeoutId);
                }
                if (completer !== undefined) {
                    completer.completeError(new Error(e.data));
                }
                delete _completers[id];
                delete _timeoutIds[id];
                delete _requests[id];
            }
            _count = 0;
        }
        function connect() {
            ready = false;
            ws = new WebSocket(self.uri);
            ws.binaryType = "arraybuffer";
            ws.onopen = onopen;
            ws.onmessage = onmessage;
            ws.onerror = onerror;
            ws.onclose = onclose;
        }
        function sendAndReceive(request) {
            if (ws === null ||
                ws.readyState === WebSocket.CLOSING ||
                ws.readyState === WebSocket.CLOSED) {
                connect();
            }
            ++_count;
            var id = getNextId();
            var completer = new Completer();
            var timeoutId;
            if (self.timeout > 0) {
                timeoutId = global.setTimeout(function() {
                    delete _completers[id];
                    delete _timeoutIds[id];
                    delete _requests[id];
                    --_count;
                    completer.completeError(new Error('timeout'));
                }, self.timeout);
            }
            _completers[id] = completer;
            _timeoutIds[id] = timeoutId;
            if (ready) {
                send(id, request);
            }
            else {
                _requests[id] = request;
                ++_reqcount;
            }
            return completer.future;
        }
        function close() {
            if (ws !== null) {
                ws.onopen = null;
                ws.onmessage = null;
                ws.onerror = null;
                ws.onclose = null;
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

    function create(uri, functions) {
        var parser = document.createElement('a');
        parser.href = uri;
        if (parser.protocol === 'ws:' ||
            parser.protocol === 'wss:') {
            return new WebSocketClient(uri, functions);
        }
        throw new Error('This client desn\'t support ' + parser.protocol + ' scheme.');
    }

    Object.defineProperty(WebSocketClient, 'create', { value: create });

    global.hprose.WebSocketClient = WebSocketClient;

}(function() {
    return this || (1, eval)('this');
}()));
