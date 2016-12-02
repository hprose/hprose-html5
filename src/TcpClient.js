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
 * LastModified: Dec 2, 2016                              *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (hprose, global, undefined) {
    'use strict';

    var ChromeTcpSocket = hprose.ChromeTcpSocket;
    var APICloudTcpSocket = hprose.APICloudTcpSocket;
    var Client = hprose.Client;
    var BytesIO = hprose.BytesIO;
    var Future = hprose.Future;
    var TimeoutError = global.TimeoutError;
    var parseuri = hprose.parseuri;

    function noop(){}

    function setReceiveHandler(socket, onreceive) {
        socket.onreceive = function(data) {
            if (!('receiveEntry' in socket)) {
                socket.receiveEntry = {
                    stream: new BytesIO(),
                    headerLength: 4,
                    dataLength: -1,
                    id: null
                };
            }
            var entry = socket.receiveEntry;
            var stream = entry.stream;
            var headerLength = entry.headerLength;
            var dataLength = entry.dataLength;
            var id = entry.id;
            stream.write(data);
            while (true) {
                if ((dataLength < 0) && (stream.length >= headerLength)) {
                    dataLength = stream.readInt32BE();
                    if ((dataLength & 0x80000000) !== 0) {
                        dataLength &= 0x7fffffff;
                        headerLength = 8;
                    }
                }
                if ((headerLength === 8) && (id === null) && (stream.length >= headerLength)) {
                    id = stream.readInt32BE();
                }
                if ((dataLength >= 0) && ((stream.length - headerLength) >= dataLength)) {
                    onreceive(stream.read(dataLength), id);
                    headerLength = 4;
                    id = null;
                    stream.trunc();
                    dataLength = -1;
                }
                else {
                    break;
                }
            }
            entry.stream = stream;
            entry.headerLength = headerLength;
            entry.dataLength = dataLength;
            entry.id = id;
        };
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
            var parser = parseuri(this.uri);
            var protocol = parser.protocol;
            var address = parser.hostname;
            var port = parseInt(parser.port, 10);
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
            var conn;
            if (global.chrome && global.chrome.sockets && global.chrome.sockets.tcp) {
                conn = new ChromeTcpSocket();
            }
            else if (global.api && global.api.require) {
                conn = new APICloudTcpSocket();
            }
            else {
                throw new Error('TCP Socket is not supported by this browser or platform.');
            }
            var self = this;
            conn.connect(address, port, {
                persistent: true,
                tls: tls,
                timeout: this.client.timeout,
                noDelay: this.client.noDelay,
                keepAlive: this.client.keepAlive
            });
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
                var conn = pool.pop();
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
            setReceiveHandler(conn, function(data, id) {
                var future = conn.futures[id];
                if (future) {
                    self.clean(conn, id);
                    if (conn.count === 0) {
                        self.recycle(conn);
                    }
                    future.resolve(data);
                }
            });
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
                    var request = this.requests.pop();
                    request.push(conn);
                    this.send.apply(this, request);
                }
                else {
                    if (this.pool.lastIndexOf(conn) < 0) {
                        this.pool.push(conn);
                    }
                }
            }
        } },
        send: { value: function(request, future, id, context, conn) {
            var self = this;
            var timeout = context.timeout;
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
            buf.writeInt32BE(len | 0x80000000);
            buf.writeInt32BE(id);
            buf.write(request);
            conn.send(buf.buffer).then(function() {
                self.sendNext(conn);
            });
        } },
        getNextId: { value: function() {
            return (this.nextid < 0x7fffffff) ? ++this.nextid : this.nextid = 0;
        } },
        sendAndReceive: { value: function(request, future, context) {
            var conn = this.fetch();
            var id = this.getNextId();
            if (conn) {
                this.send(request, future, id, context, conn);
            }
            else if (this.size < this.client.maxPoolSize) {
                conn = this.create();
                conn.onerror = function(e) {
                    future.reject(e);
                };
                var self = this;
                conn.onconnect = function() {
                    self.init(conn);
                    self.send(request, future, id, context, conn);
                };
            }
            else {
                this.requests.push([request, future, id, context]);
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
                var conn = pool.pop();
                if (conn.connected) {
                    conn.clearTimeout();
                    conn.ref();
                    return conn;
                }
            }
            return null;
        } },
        recycle: { value: function(conn) {
            if (this.pool.lastIndexOf(conn) < 0) {
                conn.unref();
                conn.setTimeout(this.client.poolTimeout, function() {
                    conn.destroy();
                });
                this.pool.push(conn);
            }
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
                var request = this.requests.pop();
                request.push(conn);
                this.send.apply(this, request);
            }
            else {
                this.recycle(conn);
            }
        } },
        send: { value: function(request, future, context, conn) {
            var self = this;
            var timeout = context.timeout;
            if (timeout > 0) {
                conn.timeoutId = global.setTimeout(function() {
                    self.clean(conn);
                    conn.destroy();
                    future.reject(new TimeoutError('timeout'));
                }, timeout);
            }
            setReceiveHandler(conn, function(data) {
                self.clean(conn);
                self.sendNext(conn);
                future.resolve(data);
            });
            conn.onerror = function(e) {
                self.clean(conn);
                future.reject(e);
            };

            var len = request.length;
            var buf = new BytesIO(4 + len);
            buf.writeInt32BE(len);
            buf.write(request);
            conn.send(buf.buffer);
        } },
        sendAndReceive: { value: function(request, future, context) {
            var conn = this.fetch();
            if (conn) {
                this.send(request, future, context, conn);
            }
            else if (this.size < this.client.maxPoolSize) {
                conn = this.create();
                var self = this;
                conn.onerror = function(e) {
                    future.reject(e);
                };
                conn.onconnect = function() {
                    self.send(request, future, context, conn);
                };
            }
            else {
                this.requests.push([request, future, context]);
            }
        } }
    });

    HalfDuplexTcpTransporter.prototype.constructor = TcpTransporter;

    function TcpClient(uri, functions, settings) {
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

        function sendAndReceive(request, context) {
            var future = new Future();
            if (_fullDuplex) {
                if ((fdtrans === null) || (fdtrans.uri !== self.uri)) {
                    fdtrans = new FullDuplexTcpTransporter(self);
                }
                fdtrans.sendAndReceive(request, future, context);
            }
            else {
                if ((hdtrans === null) || (hdtrans.uri !== self.uri)) {
                    hdtrans = new HalfDuplexTcpTransporter(self);
                }
                hdtrans.sendAndReceive(request, future, context);
            }
            if (context.oneway) { future.resolve(); }
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
        var parser = parseuri(uri);
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
            throw new Error('You should set server uri first!');
        }
        return new TcpClient(uri, functions, settings);
    }

    Object.defineProperty(TcpClient, 'create', { value: create });

    hprose.TcpClient = TcpClient;

})(hprose, hprose.global);
