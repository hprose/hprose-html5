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
 * Loader.js                                              *
 *                                                        *
 * hprose CommonJS/AMD/CMD loader for HTML5.              *
 *                                                        *
 * LastModified: Nov 18, 2016                             *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

/* global define, module */
(function (hprose) {
    'use strict';

    hprose.common = {
        Completer: hprose.Completer,
        Future: hprose.Future,
        ResultMode: hprose.ResultMode
    };

    hprose.io = {
        BytesIO: hprose.BytesIO,
        ClassManager: hprose.ClassManager,
        Tags: hprose.Tags,
        RawReader: hprose.RawReader,
        Reader: hprose.Reader,
        Writer: hprose.Writer,
        Formatter: hprose.Formatter
    };

    hprose.client = {
        Client: hprose.Client,
        HttpClient: hprose.HttpClient,
        TcpClient: hprose.TcpClient,
        WebSocketClient: hprose.WebSocketClient
    };

    hprose.filter = {
        JSONRPCClientFilter: hprose.JSONRPCClientFilter
    };

    if (typeof define === 'function') {
        if (define.cmd) {
            define('hprose', [], hprose);
        }
        else if (define.amd) {
            define('hprose', [], function() { return hprose; });
        }
    }
    if (typeof module === 'object') {
        module.exports = hprose;
    }
})(hprose);
