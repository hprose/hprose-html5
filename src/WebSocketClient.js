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
    var s_id = 0;
    var s_messagecount = 0;
    var s_completers = Object.create(null);
    var s_timeoutId = Object.create(null);
    var s_messages = Object.create(null);

    function WebSocketClient(uri, functions) {
        if (this.constructor !== WebSocketClient) return new WebSocketClient(uri, functions);
        Client.call(this, uri, functions);
        this.timeout = 0;
        var self = this;
        var ready = false;
        var ws;
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
            if (s_messagecount > 0) {
                for (var id in s_messages) {
                    send(id, s_messages[id]);
                    delete s_messages[id];
                }
            }
            s_messagecount = 0;
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
            }
            if (completer !== undefined) {
                completer.complete(bytes.read(bytes.length - 4));
            }
        }
        function onclose(e) {
            connect();
        }
        function onerror(e) {
            for (var id in s_completers) {
                var timeoutId = s_timeoutId[id];
                var completer = s_completers[id];
                completer.completeError(new Error(e.data));
                if (timeoutId !== undefined) {
                    global.clearTimeout(timeoutId);
                }
                delete s_completers[id];
                delete s_timeoutId[id];
                delete s_messages[id];
            }
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
            var completer = new Completer();
            var timeoutId;
            if (self.timeout > 0) {
                timeoutId = global.setTimeout((function (id) {
                    return function() {
                        delete s_completers[id];
                        delete s_timeoutId[id];
                        delete s_messages[id];
                        completer.completeError(new Error('timeout'));
                    };
                })(s_id), self.timeout);
            }
            s_completers[s_id] = completer;
            s_timeoutId[s_id] = timeoutId;
            if (ready) {
                send(s_id, request);
            }
            else {
                s_messages[s_id] = request;
                ++s_messagecount;
            }
            if (s_id < 0x7fffffff) {
                ++s_id;
            }
            else {
                s_id = 0;
            }
            return completer.future;
        }
        Object.defineProperties(this, {
            sendAndReceive: { value: sendAndReceive }
        });
        connect();
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
