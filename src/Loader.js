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
 * LastModified: May 4, 2015                              *
 * Author: Ma Bingyao <andot@hprose.com>                  *
 *                                                        *
\**********************************************************/

(function (global) {
    'use strict';
    global.hprose = global.hprose || Object.create(null);
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