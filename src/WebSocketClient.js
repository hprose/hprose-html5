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
 * LastModified: Apr 17, 2015                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    var Exception = global.hprose.Exception;
    var Client = global.hprose.Client;
    var BytesIO = global.hprose.BytesIO;
    var Completer = global.hprose.Completer;

    function noop(){}
    var s_id = 0;
    var s_completers = [];
    var s_timeoutId = [];
    var s_messages = [];

    global.hprose.WebSocketClient = function WebSocketClient(uri, functions) {
        Client.call(this, uri, functions);
        var _timeout = 0;
        var self = this;
        var ready = false;
        var ws;
        function send_message(id, request) {
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
            if (s_messages.length > 0) {
                for (var id in s_messages) {
                    send_message(id, s_messages[id]);
                }
                s_messages = [];
            }
        }
        function onmessage(e) {
            var bytes = new BytesIO(e.data);
            var id = bytes.readByte() << 24;
            id = id | bytes.readByte() << 16;
            id = id | bytes.readByte() << 8;
            id = id | bytes.readByte();
            var timeoutId = s_timeoutId[id];
            var completer = s_completers[id];
            delete s_timeoutId[id];
            delete s_completers[id];
            if (timeoutId !== undefined) {
                global.clearTimeout(timeoutId);
                timeoutId = undefined;
            }
            completer.complete(bytes.read(bytes.length - 4));
        }
        function onclose(e) {
            connect();
        }
        function onerror(e) {
            self.onerror("WebSocket", new Exception(e.data));
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
        function send(request) {
            var completer = new Completer();
            var timeoutId = undefined;
            if (_timeout > 0) {
                timeoutId = global.setTimeout((function (id) {
                    return function() {
                        delete s_completers[id];
                        delete s_timeoutId[id];
                        delete s_messages[id];
                        ws.close();
                        completer.completeError(new Exception('timeout'));
                    }
                })(s_id), _timeout);
            }
            s_completers[s_id] = completer;
            s_timeoutId[s_id] = timeoutId;
            if (ready) {
                send_message(s_id, request);
            }
            else {
                s_messages[s_id] = request;
            }
            if (s_id < 0x7fffffff) {
                ++s_id;
            }
            else {
                s_id = 0;
            }
            return completer.future;
        }
        function setTimeout(value) {
            if (typeof(value) === 'number') {
                _timeout = value | 0;
            }
            else {
                _timeout = 0;
            }
        }
        function getTimeout() {
            return _timeout;
        }
        Object.defineProperties(this, {
            timeout: { get: getTimeout, set: setTimeout },
            __send__: { value: send }
        });
        connect();
    };

    function create(uri, functions) {
        var parser = document.createElement('a');
        parser.href = uri;
        if (parser.protocol === 'ws:' ||
            parser.protocol === 'wss:') {
            return new global.hprose.WebSocketClient(uri, functions);
        }
        throw new Exception('This client desn\'t support ' + parser.protocol + ' scheme.');
    }

    Object.defineProperty(global.hprose.WebSocketClient, 'create', { value: create });
})(this);
