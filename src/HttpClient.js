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
 * LastModified: Mar 5, 2015                              *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    var Tags = global.hprose.Tags;
    var Exception = global.hprose.Exception;
    var Client = global.hprose.Client;
    var BytesIO = global.hprose.BytesIO;
    var serialize = global.hprose.serialize;
    var Completer = global.hprose.Completer;

    function noop(){}

    global.hprose.HttpClient = function HttpClient(uri, functions) {
        Client.call(this, uri, functions);
        var _header = Object.create(null);
        var _timeout = 30000;
        var _onreqprogress = noop;
        var _onresprogress = noop;

        var self = this;
        function send(request) {
            var completer = new Completer();
            var xhr = new XMLHttpRequest();
            xhr.open('POST', self.uri, true);
            if (location.protocol !== 'file:') {
                xhr.withCredentials = 'true';
            }
            xhr.responseType = 'arraybuffer';
            for (var name in _header) {
                xhr.setRequestHeader(name, _header[name]);
            }
            var timeoutId;
            xhr.onload = function () {
                xhr.onload = function() {};
                if (timeoutId !== undefined) {
                    global.clearTimeout(timeoutId);
                }
                if (xhr.status === 200) {
                    completer.complete(new Uint8Array(xhr.response));
                }
                else if (xhr.status !== 0) {
                    completer.completeError(new Exception(xhr.status + ':' + xhr.statusText));
                }
            };
            xhr.onerror = function() {
                completer.completeError(new Exception('error'));
            };
            function ontimeout() {
                completer.completeError(new Exception('timeout'));
            }
            if (xhr.timeout === undefined) {
                timeoutId = global.setTimeout(function () {
                    xhr.onload = function() {};
                    xhr.abort();
                    ontimeout();
                }, _timeout);
            }
            else {
                xhr.timeout = _timeout;
                xhr.ontimeout = ontimeout;
            }
            xhr.upload.onprogress = _onreqprogress;
            xhr.onprogress = _onresprogress;
            if (request.constructor === String || ArrayBuffer.isView) {
                xhr.send(request);
            }
            else if (request.buffer.slice) {
                xhr.send(request.buffer.slice(0, request.length));
            }
            else {
                xhr.send(request.buffer);
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
            timeout: { get: getTimeout, set: setTimeout },
            onProgress: { get: getOnRequestProgress, set: setOnRequestProgress },
            onprogress: { get: getOnRequestProgress, set: setOnRequestProgress },
            onRequestProgress: { get: getOnRequestProgress, set: setOnRequestProgress },
            onResponseProgress: { get: getOnResponseProgress, set: setOnResponseProgress },
            setHeader: { value: setHeader },
            __send__: { value: send }
        });
    };

    function create(uri, functions) {
        var parser = document.createElement('a');
        parser.href = uri;
        if (parser.protocol === 'http:' ||
            parser.protocol === 'https:') {
            return new global.hprose.HttpClient(uri, functions);
        }
        throw new Exception('This client desn\'t support ' + parser.protocol + ' scheme.');
    }

    Object.defineProperty(global.hprose.HttpClient, 'create', { value: create });
})(this);
