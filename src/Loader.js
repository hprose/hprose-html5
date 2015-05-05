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
 * LastModified: May 5, 2015                              *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';

    global.hprose.common = {
        Exception: global.hprose.Exception,
        ResultMode: global.hprose.ResultMode,
        Filter: global.hprose.Filter
    };

    global.hprose.io = {
        ClassManager: global.hprose.ClassManager,
        BytesIO: global.hprose.BytesIO,
        Tags: global.hprose.Tags,
        RawReader: global.hprose.RawReader,
        Reader: global.hprose.Reader,
        Writer: global.hprose.Writer,
        Formatter: global.hprose.Formatter
    };

    global.hprose.client = {
        Client: global.hprose.Client,
        HttpClient: global.hprose.HttpClient,
        WebSocketClient: global.hprose.WebSocketClient,
        JSONRPCClientFilter: global.hprose.JSONRPCClientFilter
    };

    if (typeof define === "function") {
        if (define.cmd) {
            define('hprose', [], global.hprose);
        }
        else if (define.amd) {
            define("hprose", [], function() { return global.hprose; });
        }
    }
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.hprose;
    }
})(this);