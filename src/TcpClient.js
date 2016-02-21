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
 * TcpClient.js                                           *
 *                                                        *
 * hprose tcp client for HTML5.                           *
 *                                                        *
 * LastModified: Feb 22, 2016                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/* jshint -W067 */
(function (global, undefined) {
    'use strict';

    var Client = global.hprose.Client;
    var BytesIO = global.hprose.BytesIO;
    var Future = global.hprose.Future;
    var tcpInit = false;

    function noop(){}

    var socketPool = {};
    var receivePool = {};

    function TCPSocket() {
        this.socketId = new Future();
        this.connected = false;
        this.timeid = undefined;
        this.onclose = noop;
        this.onconnect = noop;
        this.onreceive = noop;
        this.onerror = noop;
    }

    Object.defineProperties(TCPSocket.prototype, {
        connect: { value: function(address, port, tls, options) {
            var self = this;
            chrome.sockets.tcp.create({ persistent: options && options.persistent }, function(createInfo) {
                if (options) {
                    if ('noDelay' in options) {
                        chrome.sockets.tcp.setNoDelay(createInfo.socketId, options.noDelay, function(result) {
                            if (result < 0) {
                                self.socketId.reject(result);
                                chrome.sockets.tcp.disconnect(createInfo.socketId);
                                chrome.sockets.tcp.close(createInfo.socketId);
                                self.onclose();
                            }
                        });
                    }
                    if ('keepAlive' in options) {
                        chrome.sockets.tcp.setKeepAlive(createInfo.socketId, options.keepAlive, function(result) {
                            if (result < 0) {
                                self.socketId.reject(result);
                                chrome.sockets.tcp.disconnect(createInfo.socketId);
                                chrome.sockets.tcp.close(createInfo.socketId);
                                self.onclose();
                            }
                        });
                    }
                }
                if (tls) {
                    chrome.sockets.tcp.setPaused(createInfo.socketId, true, function() {
                        chrome.sockets.tcp.connect(createInfo.socketId, address, port, function(result) {
                            if (result < 0) {
                                self.socketId.reject(result);
                                chrome.sockets.tcp.disconnect(createInfo.socketId);
                                chrome.sockets.tcp.close(createInfo.socketId);
                                self.onclose();
                            }
                            else {
                                chrome.sockets.tcp.secure(createInfo.socketId, function(secureResult) {
                                    if (secureResult !== 0) {
                                        self.socketId.reject(result);
                                        chrome.sockets.tcp.disconnect(createInfo.socketId);
                                        chrome.sockets.tcp.close(createInfo.socketId);
                                        self.onclose();
                                    }
                                    else {
                                        chrome.sockets.tcp.setPaused(createInfo.socketId, false, function() {
                                            self.socketId.resolve(createInfo.socketId);
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
                else {
                    chrome.sockets.tcp.connect(createInfo.socketId, address, port, function(result) {
                        if (result < 0) {
                            self.socketId.reject(result);
                            chrome.sockets.tcp.disconnect(createInfo.socketId);
                            chrome.sockets.tcp.close(createInfo.socketId);
                            self.onclose();
                        }
                        else {
                            self.socketId.resolve(createInfo.socketId);
                        }
                    });
                }
            });
            this.socketId.then(function(socketId) {
                socketPool[socketId] = self;
                self.connected = true;
                self.onconnect(socketId);
            }, function(reason) {
                self.onerror(reason);
            });
        } },
        send: { value: function(data) {
            var self = this;
            var promise = new Future();
            this.socketId.then(function(socketId) {
                chrome.sockets.tcp.send(socketId, data, function(sendInfo) {
                    if (sendInfo.resultCode < 0) {
                        self.onerror(sendInfo.resultCode);
                        promise.reject(sendInfo.resultCode);
                        self.destroy();
                    }
                    else {
                        promise.resolve(sendInfo.bytesSent);
                    }
                });
            });
            return promise;
        } },
        destroy: { value: function() {
            var self = this;
            this.connected = false;
            this.socketId.then(function(socketId) {
                chrome.sockets.tcp.disconnect(socketId);
                chrome.sockets.tcp.close(socketId);
                delete socketPool[socketId];
                delete receivePool[socketId];
                self.onclose();
            });
        } },
        ref: { value: function() {
            this.socketId.then(function(socketId) {
                chrome.sockets.tcp.setPaused(socketId, false);
            });
        } },
        unref: { value: function() {
            this.socketId.then(function(socketId) {
                chrome.sockets.tcp.setPaused(socketId, true);
            });
        } },
        clearTimeout: { value: function() {
            if (this.timeid !== undefined) {
                global.clearTimeout(this.timeid);
            }
        } },
        setTimeout: { value: function(timeout, fn) {
            this.clearTimeout();
            this.timeid = global.setTimeout(fn, timeout);
        } }
    });

    function receiveListener(info) {
        if (!(info.socketId in receivePool)) {
            receivePool[info.socketId] = {
                bytes: new BytesIO(),
                headerLength: 4,
                dataLength: -1,
                id: null
            };
        }
        var socket = socketPool[info.socketId];
        var entry = receivePool[info.socketId];
        var bytes = entry.bytes;
        var headerLength = entry.headerLength;
        var dataLength = entry.dataLength;
        var id = entry.id;
        bytes.write(info.data);
        while (true) {
            if ((dataLength < 0) && (bytes.length >= headerLength)) {
                dataLength = bytes.readInt32BE();
                if ((dataLength & 0x80000000) !== 0) {
                    dataLength &= 0x7fffffff;
                    headerLength = 8;
                }
            }
            if ((headerLength === 8) && (id === null) && (bytes.length >= headerLength)) {
                id = bytes.readInt32BE();
            }
            if ((dataLength >= 0) && ((bytes.length - headerLength) >= dataLength)) {
                socket.onreceive(bytes.read(dataLength), id);
                headerLength = 4;
                id = null;
                bytes.trunc();
                dataLength = -1;
            }
            else {
                break;
            }
        }
        entry.bytes = bytes;
        entry.headerLength = headerLength;
        entry.dataLength = dataLength;
        entry.id = id;
    }

    function receiveErrorListener(info) {
        var socket = socketPool[info.socketId];
        socket.onerror(info.resultCode);
        socket.destroy();
    }

    function TcpTransporter(client) {
        if (client) {
            this.client = client;
            this.uri = this.client.uri;
            this.size = 0;
            this.pool = [];
            this.requests = [];
        }
    }

    Object.defineProperties(TcpTransporter.prototype, {
        create: { value: function() {
            var parser = document.createElement('a');
            parser.href = this.uri;
            var protocol = parser.protocol;
            // HTMLAnchorElement can't parse TCP protocol
            // replace to HTTP can be correctly resolved.
            parser.protocol = "http:";
            var address = parser.hostname;
            var port = parseInt(parser.port);
            var tls;
            if (protocol === 'tcp:' ||
                protocol === 'tcp4:' ||
                protocol === 'tcp6:') {
                tls = false;
            }
            else if (protocol === 'tcps:' ||
                protocol === 'tcp4s:' ||
                protocol === 'tcp6s:' ||
                protocol === 'tls:') {
                tls = true;
            }
            else {
                throw new Error('Unsupported ' + protocol + ' protocol!');
            }
            var conn = new TCPSocket();
            var self = this;
            conn.connect(address, port, tls, this.client.options);
            conn.onclose = function() { --self.size; };
            ++this.size;
            return conn;
        } }
    });

    function FullDuplexTcpTransporter(client) {
        TcpTransporter.call(this, client);
    }

    FullDuplexTcpTransporter.prototype = Object.create(
        TcpTransporter.prototype, {
        fetch: { value: function() {
            var pool = this.pool;
            while (pool.length > 0) {
                var conn = pool.shift();
                if (conn.connected) {
                    if (conn.count === 0) {
                        conn.clearTimeout();
                        conn.ref();
                    }
                    return conn;
                }
            }
            return null;
        } },
        init: { value: function(conn) {
            var self = this;
            conn.count = 0;
            conn.futures = {};
            conn.timeoutIds = {};
            conn.onreceive = function (data, id) {
                var future = conn.futures[id];
                if (future) {
                    self.clean(conn, id);
                    if (conn.count === 0) {
                        self.recycle(conn);
                    }
                    future.resolve(data);
                }
            };
            conn.onerror = function (e) {
                var futures = conn.futures;
                for (var id in futures) {
                    var future = futures[id];
                    self.clean(conn, id);
                    future.reject(e);
                }
            };
        } },
        recycle: { value: function(conn) {
            conn.unref();
            conn.setTimeout(this.client.poolTimeout, function() {
                 conn.destroy();
            });
        } },
        clean: { value: function(conn, id) {
            if (conn.timeoutIds[id] !== undefined) {
                global.clearTimeout(conn.timeoutIds[id]);
                delete conn.timeoutIds[id];
            }
            delete conn.futures[id];
            --conn.count;
            this.sendNext(conn);
        } },
        sendNext: { value: function(conn) {
            if (conn.count < 10) {
                if (this.requests.length > 0) {
                    var request = this.requests.shift();
                    request.push(conn);
                    this.send.apply(this, request);
                }
                else {
                    this.pool.push(conn);
                }
            }
        } },
        send: { value: function(request, future, id, env, conn) {
            var self = this;
            var timeout = env.timeout;
            if (timeout > 0) {
                conn.timeoutIds[id] = global.setTimeout(function() {
                    self.clean(conn, id);
                    if (conn.count === 0) {
                        self.recycle(conn);
                    }
                    future.reject(new TimeoutError('timeout'));
                }, timeout);
            }
            conn.count++;
            conn.futures[id] = future;

            var len = request.length;
            var buf = new BytesIO(8 + len);
            buf.writeInt32BE(len | 0x80000000, 0);
            buf.writeInt32BE(id, 4);
            buf.write(request);
            conn.send(buf.buffer).then(function(result) {
                self.sendNext(conn);
            });
        } },
        getNextId: { value: function() {
            return (this.nextid < 0x7fffffff) ? ++this.nextid : this.nextid = 0;
        } },
        sendAndReceive: { value: function(request, future, env) {
            var conn = this.fetch();
            var id = this.getNextId();
            if (conn) {
                this.send(request, future, id, env, conn);
            }
            else if (this.size < this.client.maxPoolSize) {
                conn = this.create();
                conn.onerror = function(e) {
                    future.reject(e);
                };
                var self = this;
                conn.onconnect = function() {
                    self.init(conn);
                    self.send(request, future, id, env, conn);
                };
            }
            else {
                this.requests.push([request, future, id, env]);
            }
        } }
    });

    FullDuplexTcpTransporter.prototype.constructor = TcpTransporter;

    function HalfDuplexTcpTransporter(client) {
        TcpTransporter.call(this, client);
    }

    HalfDuplexTcpTransporter.prototype = Object.create(
        TcpTransporter.prototype, {
        fetch: { value: function() {
            var pool = this.pool;
            while (pool.length > 0) {
                var conn = pool.shift();
                if (conn.connected) {
                    conn.clearTimeout();
                    conn.ref();
                    return conn;
                }
            }
            return null;
        } },
        recycle: { value: function(conn) {
            conn.unref();
            conn.setTimeout(this.client.poolTimeout, function() {
                 conn.destroy();
            });
            this.pool.push(conn);
        } },
        clean: { value: function(conn) {
            conn.onreceive = noop;
            conn.onerror = noop;
            if (conn.timeoutId !== undefined) {
                global.clearTimeout(conn.timeoutId);
                delete conn.timeoutId;
            }
        } },
        sendNext: { value: function(conn) {
            if (this.requests.length > 0) {
                var request = this.requests.shift();
                request.push(conn);
                this.send.apply(this, request);
            }
            else {
                this.recycle(conn);
            }
        } },
        send: { value: function(request, future, env, conn) {
            var self = this;
            var timeout = env.timeout;
            if (timeout > 0) {
                conn.timeoutId = global.setTimeout(function() {
                    self.clean(conn);
                    self.recycle(conn);
                    future.reject(new TimeoutError('timeout'));
                }, timeout);
            }
            conn.onreceive = function(data) {
                self.clean(conn);
                self.sendNext(conn);
                future.resolve(data);
            };
            conn.onerror = function(e) {
                self.clean(conn);
                future.reject(e);
            };

            var len = request.length;
            var buf = new BytesIO(4 + len);
            buf.writeInt32BE(len, 0);
            buf.write(request);
            conn.send(buf.buffer);
        } },
        sendAndReceive: { value: function(request, future, env) {
            var conn = this.fetch();
            if (conn) {
                this.send(request, future, env, conn);
            }
            else if (this.size < this.client.maxPoolSize) {
                conn = this.create();
                var self = this;
                conn.onerror = function(e) {
                    future.reject(e);
                };
                conn.onconnect = function() {
                    self.send(request, future, env, conn);
                };
            }
            else {
                this.requests.push([request, future, env]);
            }
        } }
    });

    HalfDuplexTcpTransporter.prototype.constructor = TcpTransporter;

    function TcpClient(uri, functions, settings) {
        if (!tcpInit) {
            tcpInit = true;
            chrome.sockets.tcp.onReceive.addListener(receiveListener);
            chrome.sockets.tcp.onReceiveError.addListener(receiveErrorListener);
        }
        if (this.constructor !== TcpClient) {
            return new TcpClient(uri, functions, settings);
        }
        Client.call(this, uri, functions, settings);

        var self = this;
        var _noDelay = true;
        var _fullDuplex = false;
        var _maxPoolSize = 10;
        var _poolTimeout = 30000;
        var fdtrans = null;
        var hdtrans = null;

        function getNoDelay() {
            return _noDelay;
        }

        function setNoDelay(value) {
            _noDelay = !!value;
        }

        function getFullDuplex() {
            return _fullDuplex;
        }

        function setFullDuplex(value) {
            _fullDuplex = !!value;
        }

        function getMaxPoolSize() {
            return _maxPoolSize;
        }

        function setMaxPoolSize(value) {
            if (typeof(value) === 'number') {
                _maxPoolSize = value | 0;
                if (_maxPoolSize < 1) {
                    _maxPoolSize = 10;
                }
            }
            else {
                _maxPoolSize = 10;
            }
        }

        function getPoolTimeout() {
            return _poolTimeout;
        }

        function setPoolTimeout(value) {
            if (typeof(value) === 'number') {
                _poolTimeout = value | 0;
            }
            else {
                _poolTimeout = 0;
            }
        }

        function sendAndReceive(request, env) {
            var future = new Future();
            if (_fullDuplex) {
                if ((fdtrans === null) || (fdtrans.uri !== self.uri)) {
                    fdtrans = new FullDuplexTcpTransporter(self);
                }
                fdtrans.sendAndReceive(request, future, env);
            }
            else {
                if ((hdtrans === null) || (hdtrans.uri !== self.uri)) {
                    hdtrans = new HalfDuplexTcpTransporter(self);
                }
                hdtrans.sendAndReceive(request, future, env);
            }
            if (env.oneway) future.resolve();
            return future;
        }

        Object.defineProperties(this, {
            noDelay: { get: getNoDelay, set: setNoDelay },
            fullDuplex: { get: getFullDuplex, set: setFullDuplex },
            maxPoolSize: { get: getMaxPoolSize, set: setMaxPoolSize },
            poolTimeout: { get: getPoolTimeout, set: setPoolTimeout },
            sendAndReceive: { value: sendAndReceive }
        });
    }

    function checkuri(uri) {
        var parser = document.createElement('a');
        parser.href = uri;
        var protocol = parser.protocol;
        if (protocol === 'tcp:' ||
            protocol === 'tcp4:'||
            protocol === 'tcp6:' ||
            protocol === 'tcps:' ||
            protocol === 'tcp4s:' ||
            protocol === 'tcp6s:' ||
            protocol === 'tls:') {
            return;
        }
        throw new Error('This client desn\'t support ' + protocol + ' scheme.');
    }

    function create(uri, functions, settings) {
        if (typeof uri === 'string') {
            checkuri(uri);
        }
        else if (Array.isArray(uri)) {
            uri.forEach(function(uri) { checkuri(uri); });
        }
        else {
            return new Error('You should set server uri first!');
        }
        return new TcpClient(uri, functions, settings);
    }

    Object.defineProperty(TcpClient, 'create', { value: create });

    global.hprose.TcpClient = TcpClient;

}(function() {
    return this || (1, eval)('this');
}()));
