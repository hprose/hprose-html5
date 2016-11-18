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
 * APICloudTcpSocket.js                                   *
 *                                                        *
 * APICloud tcp socket for HTML5.                         *
 *                                                        *
 * LastModified: Nov 18, 2016                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (hprose, global, undefined) {
    'use strict';

    var Future = hprose.Future;
    var atob = global.atob;
    var btoa = global.btoa;
    var toUint8Array = hprose.toUint8Array;
    var toBinaryString = hprose.toBinaryString;

    function noop(){}

    var socketPool = {};
    var socketManager = null;

    function APICloudTcpSocket() {
        if (socketManager === null) {
            socketManager = global.api.require('socketManager');
        }
        this.socketId = new Future();
        this.connected = false;
        this.timeid = undefined;
        this.onclose = noop;
        this.onconnect = noop;
        this.onreceive = noop;
        this.onerror = noop;
    }

    Object.defineProperties(APICloudTcpSocket.prototype, {
        connect: { value: function(address, port, options) {
            var self = this;
            socketManager.createSocket({
                type: 'tcp',
                host: address,
                port: port,
                timeout: options.timeout,
                returnBase64: true
            },
            function(ret/*, err*/) {
                if (ret) {
                    switch(ret.state) {
                        case 101: break;
                        case 102: self.socketId.resolve(ret.sid); break;
                        case 103: self.onreceive(toUint8Array(atob(ret.data.replace(/\s+/g, '')))); break;
                        case 201: self.socketId.reject(new Error('Create TCP socket failed')); break;
                        case 202: self.socketId.reject(new Error('TCP connection failed')); break;
                        case 203: self.onclose(); self.onerror(new Error('Abnormal disconnect connection')); break;
                        case 204: self.onclose(); break;
                        case 205: self.onclose(); self.onerror(new Error('Unknown error')); break;
                    }
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
                socketManager.write({
                    sid: socketId,
                    data: btoa(toBinaryString(data)),
                    base64: true
                },
                function(ret, err) {
                    if (ret.status) {
                        promise.resolve();
                    }
                    else {
                        self.onerror(new Error(err.msg));
                        promise.reject(err.msg);
                        self.destroy();
                    }
                });
            });
            return promise;
        } },
        destroy: { value: function() {
            var self = this;
            this.connected = false;
            this.socketId.then(function(socketId) {
                socketManager.closeSocket({
                    sid: socketId
                },
                function(ret, err) {
                    if (!ret.status) {
                        self.onerror(new Error(err.msg));
                    }
                });
                delete socketPool[socketId];
                //self.onclose();
            });
        } },
        ref: { value: noop },
        unref: { value: noop },
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

    hprose.APICloudTcpSocket = APICloudTcpSocket;

})(hprose, hprose.global);
