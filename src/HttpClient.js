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
 * LastModified: Dec 2, 2016                              *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (hprose, global, undefined) {
    'use strict';

    var Client = hprose.Client;
    var Future = hprose.Future;
    var BytesIO = hprose.BytesIO;
    var TimeoutError = global.TimeoutError;
    var localfile = (global.location !== undefined && global.location.protocol === 'file:');
    var XMLHttpRequest = global.XMLHttpRequest;
    var nativeXHR = (typeof(XMLHttpRequest) !== 'undefined');
    var corsSupport = (!localfile && nativeXHR && 'withCredentials' in new XMLHttpRequest());
    var parseuri = hprose.parseuri;
    var cookieManager = hprose.cookieManager;

    function noop(){}

    function getResponseHeader(headers) {
        var header = Object.create(null);
        if (headers) {
            headers = headers.split("\r\n");
            for (var i = 0, n = headers.length; i < n; i++) {
                if (headers[i] !== "") {
                    var kv = headers[i].split(": ", 2);
                    var k = kv[0].trim();
                    var v = kv[1].trim();
                    if (k in header) {
                        if (Array.isArray(header[k])) {
                            header[k].push(v);
                        }
                        else {
                            header[k] = [header[k], v];
                        }
                    }
                    else {
                        header[k] = v;
                    }
                }
            }
        }
        return header;
    }

    function HttpClient(uri, functions, settings) {
        if (this.constructor !== HttpClient) {
            return new HttpClient(uri, functions, settings);
        }
        Client.call(this, uri, functions, settings);
        var _header = Object.create(null);
        var _onreqprogress = noop;
        var _onresprogress = noop;

        var self = this;

        function getRequestHeader(headers) {
            var header = Object.create(null);
            var name, value;
            for (name in _header) {
                header[name] = _header[name];
            }
            if (headers) {
                for (name in headers) {
                    value = headers[name];
                    if (Array.isArray(value)) {
                        header[name] = value.join(', ');
                    }
                    else {
                        header[name] = value;
                    }
                }
            }
            return header;
        }

        function xhrPost(request, context) {
            var future = new Future();
            var xhr = new XMLHttpRequest();
            xhr.open('POST', self.uri, true);
            if (corsSupport) {
                xhr.withCredentials = 'true';
            }
            xhr.responseType = 'arraybuffer';
            var header = getRequestHeader(context.httpHeader);
            for (var name in header) {
                xhr.setRequestHeader(name, header[name]);
            }
            xhr.onload = function() {
                xhr.onload = noop;
                if (xhr.status) {
                    var headers = xhr.getAllResponseHeaders();
                    context.httpHeader = getResponseHeader(headers);
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
            if (context.timeout > 0) {
                future = future.timeout(context.timeout).catchError(function(e) {
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

        function apiPost(request, context) {
            var future = new Future();
            var header = getRequestHeader(context.httpHeader);
            var cookie = cookieManager.getCookie(self.uri());
            if (cookie !== '') {
                header['Cookie'] = cookie;
            }
            global.api.ajax({
                url: self.uri,
                method: 'post',
                data: { body: BytesIO.toString(request) },
                timeout: context.timeout,
                dataType: 'text',
                headers: header,
                returnAll: true,
                certificate: self.certificate
            }, function(ret, err) {
                if (ret) {
                    context.httpHeader = ret.headers;
                    if (ret.statusCode === 200) {
                        cookieManager.setCookie(ret.headers, self.uri);
                        future.resolve((new BytesIO(ret.body)).takeBytes());
                    }
                    else {
                        future.reject(new Error(ret.statusCode+':'+ret.body));
                    }
                }
                else {
                    future.reject(new Error(err.msg));
                }                
            });
            return future;
        }

        function sendAndReceive(request, context) {
            var apicloud = (typeof(global.api) !== "undefined" &&
                           typeof(global.api.ajax) !== "undefined");
            var future = apicloud ? apiPost(request, context) :
                                    xhrPost(request, context);
            if (context.oneway) { future.resolve(); }
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
        var parser = parseuri(uri);
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

    hprose.HttpClient = HttpClient;

})(hprose, hprose.global);
