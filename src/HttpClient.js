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
 * HttpClient.js                                          *
 *                                                        *
 * hprose http client for HTML5.                          *
 *                                                        *
 * LastModified: Feb 28, 2016                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global, undefined) {
    'use strict';

    var Client = global.hprose.Client;
    var Future = global.hprose.Future;
    var BytesIO = global.hprose.BytesIO;
    var TimeoutError = global.TimeoutError;

    function noop(){}

    function HttpClient(uri, functions, settings) {
        if (this.constructor !== HttpClient) {
            return new HttpClient(uri, functions, settings);
        }
        Client.call(this, uri, functions, settings);
        var _header = Object.create(null);
        var _onreqprogress = noop;
        var _onresprogress = noop;

        var self = this;

        function xhrPost(request, env) {
            var future = new Future();
            var xhr = new XMLHttpRequest();
            xhr.open('POST', self.uri, true);
            if (global.location !== undefined && global.location.protocol !== 'file:') {
                xhr.withCredentials = 'true';
            }
            xhr.responseType = 'arraybuffer';
            for (var name in _header) {
                xhr.setRequestHeader(name, _header[name]);
            }
            xhr.onload = function() {
                xhr.onload = noop;
                if (xhr.status) {
                    if (xhr.status === 200) {
                        future.resolve(new Uint8Array(xhr.response));
                    }
                    else {
                        future.reject(new Error(xhr.status + ':' + xhr.statusText));
                    }
                }
            };
            xhr.onerror = function() {
                future.reject(new Error('error'));
            };
            if (xhr.upload !== undefined) {
                xhr.upload.onprogress = _onreqprogress;
            }
            xhr.onprogress = _onresprogress;
            if (env.timeout > 0) {
                future = future.timeout(env.timeout).catchError(function(e) {
                    xhr.onload = noop;
                    xhr.onerror = noop;
                    xhr.abort();
                    throw e;
                },
                function(e) {
                    return e instanceof TimeoutError;
                });
            }
            if (request.constructor === String || ArrayBuffer.isView) {
                xhr.send(request);
            }
            else if (request.buffer.slice) {
                xhr.send(request.buffer.slice(0, request.length));
            }
            else {
                var buf = new Uint8Array(request.length);
                buf.set(request);
                xhr.send(buf.buffer);
            }
            return future;
        }

        function apiPost(request, env) {
            var future = new Future();
            global.api.ajax({
                url: self.uri(),
                method: 'post',
                data: { body: BytesIO.toString(request) },
                timeout: env.timeout,
                dataType: 'text',
                headers: _header,
                certificate: self.certificate
            }, function(ret, err) {
                if (ret) {
                    future.resolve((new BytesIO(ret)).takeBytes());
                }
                else {
                    future.reject(new Error(err.msg));
                }
            });
            return future;
        }

        function sendAndReceive(request, env) {
            var apicloud = (typeof(global.api) !== "undefined" &&
                           typeof(global.api.ajax) !== "undefined");
            var future = apicloud ? apiPost(request, env) :
                                    xhrPost(request, env);
            if (env.oneway) { future.resolve(); }
            return future;
        }

        function setOnRequestProgress(value) {
            if (typeof(value) === 'function') {
                _onreqprogress = value;
            }
        }
        function getOnRequestProgress() {
            return _onreqprogress;
        }
        function setOnResponseProgress(value) {
            if (typeof(value) === 'function') {
                _onresprogress = value;
            }
        }
        function getOnResponseProgress() {
            return _onresprogress;
        }
        function setHeader(name, value) {
            if (name.toLowerCase() !== 'content-type' &&
                name.toLowerCase() !== 'content-length') {
                if (value) {
                    _header[name] = value;
                }
                else {
                    delete _header[name];
                }
            }
        }
        Object.defineProperties(this, {
            onprogress: { get: getOnRequestProgress, set: setOnRequestProgress },
            onRequestProgress: { get: getOnRequestProgress, set: setOnRequestProgress },
            onResponseProgress: { get: getOnResponseProgress, set: setOnResponseProgress },
            setHeader: { value: setHeader },
            sendAndReceive: { value: sendAndReceive }
        });
    }

    function checkuri(uri) {
        var parser = document.createElement('a');
        parser.href = uri;
        if (parser.protocol === 'http:' ||
            parser.protocol === 'https:') {
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
        return new HttpClient(uri, functions, settings);
    }

    Object.defineProperty(HttpClient, 'create', { value: create });

    global.hprose.HttpClient = HttpClient;

})(this);
