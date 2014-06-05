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
 * LastModified: Jun 5, 2014                              *
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

    function noop(){}

    global.hprose.HttpClient = function HttpClient(uri, functions) {
        Client.call(this, uri, functions);
        var _header = Object.create(null);
        var _timeout = 30000;
        var _onprogress = noop;

        var self = this;
        function send(request, callback) {
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
                    callback(new Uint8Array(xhr.response), true);
                }
                else if (xhr.status !== 0) {
                    var error = xhr.status + ':' + xhr.statusText;
                    var buffer = new BytesIO();
                    buffer.writeByte(Tags.TagError);
                    buffer.write(serialize(error, true));
                    buffer.writeByte(Tags.TagEnd);
                    callback(buffer.bytes);
                }
            };
            xhr.onerror = function() {
                var buffer = new BytesIO();
                buffer.writeByte(Tags.TagError);
                buffer.write(serialize('error', true));
                buffer.writeByte(Tags.TagEnd);
                callback(buffer.bytes);
            };
            function ontimeout() {
                var buffer = new BytesIO();
                buffer.writeByte(Tags.TagError);
                buffer.write(serialize('timeout', true));
                buffer.writeByte(Tags.TagEnd);
                callback(buffer.bytes);
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
            xhr.upload.onprogress = _onprogress;
            xhr.send(request);
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
        function setOnProgress(value) {
            if (typeof(value) === 'function') {
                _onprogress = value;
            }
        }
        function getOnProgress() {
            return _onprogress;
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
            onProgress: { get: getOnProgress, set: setOnProgress },
            onprogress: { get: getOnProgress, set: setOnProgress },
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