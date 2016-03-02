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
 * ChromeTcpSocket.js                                     *
 *                                                        *
 * chrome tcp socket for JavaScript.                      *
 *                                                        *
 * LastModified: Mar 1, 2016                              *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global, undefined) {
    'use strict';

    var Future = global.hprose.Future;
    var createObject = global.hprose.createObject;
    var defineProperties = global.hprose.defineProperties;
    var toUint8Array = global.hprose.toUint8Array;
    var toBinaryString = global.hprose.toBinaryString;

    function noop(){}

    var socketPool = {};
    var socketManager = null;

    function receiveListener(info) {
        var socket = socketPool[info.socketId];
        socket.onreceive(toBinaryString(info.data));
    }

    function receiveErrorListener(info) {
        var socket = socketPool[info.socketId];
        socket.onerror(info.resultCode);
        socket.destroy();
    }

    function ChromeTcpSocket() {
        if (socketManager === null) {
            socketManager = chrome.sockets.tcp;
            socketManager.onReceive.addListener(receiveListener);
            socketManager.onReceiveError.addListener(receiveErrorListener);
        }
        this.socketId = new Future();
        this.connected = false;
        this.timeid = undefined;
        this.onclose = noop;
        this.onconnect = noop;
        this.onreceive = noop;
        this.onerror = noop;
    }

    defineProperties(ChromeTcpSocket.prototype, {
        connect: { value: function(address, port, options) {
            var self = this;
            socketManager.create({ persistent: options && options.persistent }, function(createInfo) {
                if (options) {
                    if ('noDelay' in options) {
                        socketManager.setNoDelay(createInfo.socketId, options.noDelay, function(result) {
                            if (result < 0) {
                                self.socketId.reject(result);
                                socketManager.disconnect(createInfo.socketId);
                                socketManager.close(createInfo.socketId);
                                self.onclose();
                            }
                        });
                    }
                    if ('keepAlive' in options) {
                        socketManager.setKeepAlive(createInfo.socketId, options.keepAlive, function(result) {
                            if (result < 0) {
                                self.socketId.reject(result);
                                socketManager.disconnect(createInfo.socketId);
                                socketManager.close(createInfo.socketId);
                                self.onclose();
                            }
                        });
                    }
                }
                if (options && options.tls) {
                    socketManager.setPaused(createInfo.socketId, true, function() {
                        socketManager.connect(createInfo.socketId, address, port, function(result) {
                            if (result < 0) {
                                self.socketId.reject(result);
                                socketManager.disconnect(createInfo.socketId);
                                socketManager.close(createInfo.socketId);
                                self.onclose();
                            }
                            else {
                                socketManager.secure(createInfo.socketId, function(secureResult) {
                                    if (secureResult !== 0) {
                                        self.socketId.reject(result);
                                        socketManager.disconnect(createInfo.socketId);
                                        socketManager.close(createInfo.socketId);
                                        self.onclose();
                                    }
                                    else {
                                        socketManager.setPaused(createInfo.socketId, false, function() {
                                            self.socketId.resolve(createInfo.socketId);
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
                else {
                    socketManager.connect(createInfo.socketId, address, port, function(result) {
                        if (result < 0) {
                            self.socketId.reject(result);
                            socketManager.disconnect(createInfo.socketId);
                            socketManager.close(createInfo.socketId);
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
            data = toUint8Array(data).buffer;
            var self = this;
            var promise = new Future();
            this.socketId.then(function(socketId) {
                socketManager.send(socketId, data, function(sendInfo) {
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
                socketManager.disconnect(socketId);
                socketManager.close(socketId);
                delete socketPool[socketId];
                self.onclose();
            });
        } },
        ref: { value: function() {
            this.socketId.then(function(socketId) {
                socketManager.setPaused(socketId, false);
            });
        } },
        unref: { value: function() {
            this.socketId.then(function(socketId) {
                socketManager.setPaused(socketId, true);
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

    global.hprose.ChromeTcpSocket = ChromeTcpSocket;

})(this);
